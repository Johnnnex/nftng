import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateOrderRef } from "@/lib";
import { createOrderSchema } from "@/data";

function isSaleWindowOpen(openAt: string | null, closeAt: string | null): boolean {
  const now = Date.now();
  if (openAt && new Date(openAt).getTime() > now) return false;
  if (closeAt && new Date(closeAt).getTime() < now) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const {
    fullName, email, phone, streetAddress,
    countryId, countryCode, stateId, cityId, deliveryMethod, paymentMethod,
    promoCode, items,
  } = parsed.data;

  const isNigeria = countryCode === "NG";

  // ── 1. Global window ───────────────────────────────────────────────────────
  const { data: cfg } = await supabase
    .from("ecommerce_config").select("sales_open_at, sales_close_at").single();

  if (!isSaleWindowOpen(cfg?.sales_open_at ?? null, cfg?.sales_close_at ?? null))
    return NextResponse.json({ error: "The storefront is currently closed" }, { status: 400 });

  // ── 2. Validate items + read stock (concurrent) ────────────────────────────
  type StockEntry = { stockId: string; currentQty: number; item: typeof items[0] };
  const stockEntries: StockEntry[] = [];

  const validations = await Promise.all(items.map(async (item) => {
    const { data: product } = await supabase
      .from("products")
      .select("is_active, sales_open_at, sales_close_at")
      .eq("id", item.productId).single();

    if (!product?.is_active)
      return `"${item.title}" is no longer available`;
    if (!isSaleWindowOpen(product.sales_open_at, product.sales_close_at))
      return `Sales for "${item.title}" are not currently open`;

    const sortedCombo = Object.keys(item.variantCombo).sort().reduce(
      (acc, k) => ({ ...acc, [k]: item.variantCombo[k] as string }), {} as Record<string, string>,
    );
    const { data: stock } = await supabase
      .from("product_stocks")
      .select("id, quantity")
      .eq("product_id", item.productId)
      .filter("combo", "eq", JSON.stringify(sortedCombo))
      .single();

    if (!stock) return `Invalid combination for "${item.title}"`;
    if (stock.quantity < item.qty) return `Not enough stock for "${item.title}" (${stock.quantity} left)`;

    stockEntries.push({ stockId: stock.id, currentQty: stock.quantity, item });
    return null;
  }));

  const firstErr = validations.find(Boolean);
  if (firstErr) return NextResponse.json({ error: firstErr }, { status: 409 });

  // ── 3. Delivery fee ────────────────────────────────────────────────────────
  let deliveryFee = 0;
  if (isNigeria && cityId && deliveryMethod) {
    const { data: dc } = await supabase
      .from("delivery_configs").select("price")
      .eq("city_id", cityId).eq("method", deliveryMethod).single();
    if (dc) deliveryFee = Number(dc.price);
  }

  // ── 4. Promo discount ──────────────────────────────────────────────────────
  let discountAmount = 0;
  let promoId: string | null = null;
  if (promoCode) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("id, discount_type, discount_value, is_active, usage_count, max_usage, starts_at, expires_at")
      .eq("code", promoCode.toUpperCase()).single();

    if (promo?.is_active) {
      const now = new Date();
      const ok = (!promo.starts_at || new Date(promo.starts_at) <= now)
               && (!promo.expires_at || new Date(promo.expires_at) >= now)
               && (promo.max_usage === null || promo.usage_count < promo.max_usage);
      if (ok) {
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        discountAmount = promo.discount_type === "percent"
          ? Math.round(subtotal * (Number(promo.discount_value) / 100))
          : Number(promo.discount_value);
        promoId = promo.id;
      }
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  // ── 5. Atomic stock decrement (optimistic lock) ────────────────────────────
  // Update only when quantity still matches what we read — prevents oversell.
  for (const { stockId, currentQty, item } of stockEntries) {
    const { data: updated } = await supabase
      .from("product_stocks")
      .update({ quantity: currentQty - item.qty })
      .eq("id", stockId)
      .eq("quantity", currentQty) // optimistic lock
      .select("id");

    if (!updated || updated.length === 0)
      return NextResponse.json({ error: `Stock just ran out for "${item.title}" — try again` }, { status: 409 });
  }

  // ── 6. Create transaction ──────────────────────────────────────────────────
  const { data: transaction, error: txErr } = await supabase
    .from("transactions")
    .insert({ amount: totalAmount, delivery_fee: deliveryFee, currency: "NGN", payment_method: paymentMethod ?? "paystack", status: "pending" })
    .select("id").single();

  if (txErr || !transaction)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });

  // ── 7. Create order (retry once on ref collision) ──────────────────────────
  let orderRef = generateOrderRef();
  let orderId: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    // Build display address
    let userAddress = streetAddress;
    if (isNigeria && cityId) {
      const { data: city } = await supabase
        .from("cities").select("name, states(name)").eq("id", cityId).single();
      if (city) {
        const stateName = (city.states as unknown as { name: string } | null)?.name ?? "";
        userAddress = [streetAddress, stateName, "Nigeria"].filter(Boolean).join(", ");
      }
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        transaction_id: transaction.id,
        user_email: email,
        user_name: fullName,
        user_phone: phone,
        user_country_id: countryId,
        user_state_id: stateId ?? null,
        user_city_id: cityId ?? null,
        user_address_line: streetAddress,
        user_address: userAddress,
        delivery_method: deliveryMethod ?? null,
        status: "pending_payment",
      })
      .select("id").single();

    if (!orderErr && order) { orderId = order.id; break; }
    if (attempt === 0 && orderErr?.code === "23505") { orderRef = generateOrderRef(); continue; }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  if (!orderId) return NextResponse.json({ error: "Failed to create order" }, { status: 500 });

  // ── 8. Order items ─────────────────────────────────────────────────────────
  await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_title: item.title,
      product_image: item.image,
      variant_combo: item.variantCombo,
      quantity: item.qty,
      unit_price: item.price,
      status: "pending",
      logistics_ready: false,
    })),
  );

  // ── 9. Promo usage increment (fire-and-forget) ─────────────────────────────
  if (promoId) {
    void (async () => {
      const { data } = await supabase.from("promo_codes").select("usage_count").eq("id", promoId).single();
      if (data) await supabase.from("promo_codes").update({ usage_count: data.usage_count + 1 }).eq("id", promoId!);
    })().catch(() => null);
  }

  // ── 10. Payment URL ────────────────────────────────────────────────────────
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  let paymentUrl = `${base}/verify-payment?ref=${orderRef}`;

  try {
    if (paymentMethod === "paystack") {
      const r = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email, amount: Math.round(totalAmount * 100),
          reference: orderRef,
          callback_url: `${base}/verify-payment?gateway=paystack&ref=${orderRef}`,
          metadata: { orderRef, fullName },
        }),
      });
      const d = await r.json();
      if (d.status && d.data?.authorization_url) paymentUrl = d.data.authorization_url;
    } else if (paymentMethod === "flutterwave") {
      const r = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_ref: orderRef, amount: totalAmount, currency: "NGN",
          redirect_url: `${base}/verify-payment?gateway=flutterwave&ref=${orderRef}`,
          customer: { email, name: fullName, phonenumber: phone },
          customizations: { title: "NFTNG Store" },
        }),
      });
      const d = await r.json();
      if (d.status === "success" && d.data?.link) paymentUrl = d.data.link;
    }
  } catch { /* gateway init failed — user redirected to verify-payment for retry */ }

  return NextResponse.json({ data: { orderRef, paymentUrl } }, { status: 201 });
}
