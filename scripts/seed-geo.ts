// seed-geo.ts — seeds countries, Nigerian states, cities/zones, and delivery configs
// run: npm run seed:geo
// idempotent — safe to run multiple times (upserts)

import { createClient } from "@supabase/supabase-js";

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
  config({ path: ".env" });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("🌍  Seeding geo data...");

  // ─── COUNTRIES ────────────────────────────────────────────────────────────

  const countries = [
    { name: "Nigeria", code: "NG" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
    { name: "Canada", code: "CA" },
    { name: "Ghana", code: "GH" },
    { name: "Kenya", code: "KE" },
    { name: "South Africa", code: "ZA" },
    { name: "Germany", code: "DE" },
    { name: "France", code: "FR" },
    { name: "Netherlands", code: "NL" },
    { name: "Italy", code: "IT" },
    { name: "Spain", code: "ES" },
    { name: "Sweden", code: "SE" },
    { name: "Norway", code: "NO" },
    { name: "Denmark", code: "DK" },
    { name: "Switzerland", code: "CH" },
    { name: "Australia", code: "AU" },
    { name: "New Zealand", code: "NZ" },
    { name: "United Arab Emirates", code: "AE" },
    { name: "Saudi Arabia", code: "SA" },
    { name: "Qatar", code: "QA" },
    { name: "Brazil", code: "BR" },
    { name: "Japan", code: "JP" },
    { name: "China", code: "CN" },
    { name: "India", code: "IN" },
    { name: "Singapore", code: "SG" },
    { name: "Malaysia", code: "MY" },
    { name: "Ireland", code: "IE" },
    { name: "Belgium", code: "BE" },
    { name: "Portugal", code: "PT" },
  ];

  const { data: countryRows, error: cErr } = await supabase
    .from("countries")
    .upsert(countries, { onConflict: "code" })
    .select("id, code");
  if (cErr) { console.error("countries:", cErr); process.exit(1); }

  const countryMap = Object.fromEntries(countryRows!.map((c) => [c.code, c.id]));
  const ngId = countryMap["NG"];
  console.log(`✅  ${countries.length} countries`);

  // ─── NIGERIAN STATES ──────────────────────────────────────────────────────

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
    "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
    "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
    "Abuja (FCT)",
  ];

  const { data: stateRows, error: sErr } = await supabase
    .from("states")
    .upsert(nigerianStates.map((name) => ({ country_id: ngId, name })), { onConflict: "country_id,name" })
    .select("id, name");
  if (sErr) { console.error("states:", sErr); process.exit(1); }

  const stateMap = Object.fromEntries(stateRows!.map((s) => [s.name, s.id]));
  console.log(`✅  ${nigerianStates.length} Nigerian states`);

  // ─── CITIES & ZONES ───────────────────────────────────────────────────────
  // format: { state, name, method, price, days }
  // Lagos zones use method 'direct'; outside Lagos use 'park' and/or 'gig'

  type CityConfig = {
    state: string;
    name: string;
    configs: { method: string; price: number; days: string }[];
  };

  const cityConfigs: CityConfig[] = [
    // ── Lagos zones (direct delivery) ────────────────────────────────────────
    { state: "Lagos", name: "Somolu/Yaba/Bariga",         configs: [{ method: "direct", price: 3000,  days: "1-2 business days" }] },
    { state: "Lagos", name: "Ikeja/Surulere/Apapa",       configs: [{ method: "direct", price: 4500,  days: "1-2 business days" }] },
    { state: "Lagos", name: "Festac/Ikotun/Agege",        configs: [{ method: "direct", price: 6000,  days: "1-2 business days" }] },
    { state: "Lagos", name: "VI/Lekki Phase 1/Ikorodu",   configs: [{ method: "direct", price: 6000,  days: "1-2 business days" }] },
    { state: "Lagos", name: "Lekki (after Admiralty)-Ajah/VGC", configs: [{ method: "direct", price: 7500, days: "1-2 business days" }] },
    { state: "Lagos", name: "Sangotedo-Awoyaya",          configs: [{ method: "direct", price: 10000, days: "1-2 business days" }] },

    // ── Outside Lagos ─────────────────────────────────────────────────────────
    { state: "Ogun",    name: "Abeokuta",    configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Ekiti",   name: "Ado-Ekiti",   configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ondo",    name: "Akungba",     configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Ondo",    name: "Akure",       configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Ago-Iwoye",   configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Osun",    name: "Ede",         configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Oyo",     name: "Ibadan",      configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Ibafo",       configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Ijebu-Ode",   configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 8500, days: "7-14 business days" }] },
    { state: "Ekiti",   name: "Ikere-Ekiti", configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Ilaro",       configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Osun",    name: "Ile-Ife",     configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Osun",    name: "Ilesha",      configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Ilishan",     configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Kwara",   name: "Ilorin",      configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Oyo",     name: "Iseyin",      configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Itori",       configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Kogi",    name: "Lokoja",      configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Oyo",     name: "Ogbomosho",   configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Kwara",   name: "Offa",        configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ondo",    name: "Ondo",        configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Osun",    name: "Osogbo",      configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ekiti",   name: "Oye-Ekiti",   configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Oyo",     name: "Oyo",         configs: [{ method: "park", price: 6000, days: "3-10 business days" }, { method: "gig", price: 9000, days: "7-14 business days" }] },
    { state: "Ogun",    name: "Shagamu",     configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Delta",   name: "Agbor",       configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Anambra", name: "Anambra",     configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Delta",   name: "Asaba",       configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Enugu",   name: "Enugu",       configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Anambra", name: "Onitsha",     configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Imo",     name: "Owerri",      configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Rivers",  name: "Port Harcourt", configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Delta",   name: "Warri",       configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Abuja (FCT)", name: "Abuja",   configs: [{ method: "park", price: 5000, days: "3-10 business days" }, { method: "gig", price: 7500, days: "7-14 business days" }] },
    { state: "Adamawa", name: "Adamawa",     configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Bauchi",  name: "Bauchi",      configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Gombe",   name: "Gombe",       configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Taraba",  name: "Jalingo",     configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Plateau", name: "Jos",         configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Kaduna",  name: "Kaduna",      configs: [{ method: "park", price: 7000, days: "3-10 business days" }, { method: "gig", price: 10500, days: "7-14 business days" }] },
    { state: "Kano",    name: "Kano",        configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Katsina", name: "Katsina",     configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Kebbi",   name: "Kebbi",       configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Borno",   name: "Maiduguri",   configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Benue",   name: "Makurdi",     configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Niger",   name: "Minna",       configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Nasarawa", name: "Lafia",      configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Sokoto",  name: "Sokoto",      configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
    { state: "Yobe",    name: "Damaturu",    configs: [{ method: "park", price: 6500, days: "3-10 business days" }, { method: "gig", price: 9750, days: "7-14 business days" }] },
  ];

  // Upsert cities
  const cityUpserts = cityConfigs.map((c) => ({
    state_id: stateMap[c.state],
    name: c.name,
  }));

  const { data: cityRows, error: cityErr } = await supabase
    .from("cities")
    .upsert(cityUpserts, { onConflict: "state_id,name" })
    .select("id, name, state_id");
  if (cityErr) { console.error("cities:", cityErr); process.exit(1); }

  const cityMap = Object.fromEntries(cityRows!.map((c) => [`${c.state_id}::${c.name}`, c.id]));
  console.log(`✅  ${cityRows!.length} cities/zones`);

  // Upsert delivery configs
  const configUpserts = cityConfigs.flatMap((c) => {
    const stateId = stateMap[c.state];
    const cityId = cityMap[`${stateId}::${c.name}`];
    if (!cityId) { console.warn(`  ⚠️  city not found: ${c.state} / ${c.name}`); return []; }
    return c.configs.map((cfg) => ({
      city_id: cityId,
      method: cfg.method,
      price: cfg.price,
      estimated_days: cfg.days,
    }));
  });

  const { error: cfgErr } = await supabase
    .from("delivery_configs")
    .upsert(configUpserts, { onConflict: "city_id,method" });
  if (cfgErr) { console.error("delivery_configs:", cfgErr); process.exit(1); }

  console.log(`✅  ${configUpserts.length} delivery configs`);
  console.log("🎉  Geo seed complete!");
}

main().catch((err) => { console.error(err); process.exit(1); });
