// seed-ecommerce-config.ts — seeds the single ecommerce_config row
// run: npm run seed:config
// idempotent — safe to run multiple times (upsert)

import { createClient } from "@supabase/supabase-js";

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
  config({ path: ".env" });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("🛒  Seeding ecommerce config...");

  const { error } = await supabase
    .from("ecommerce_config")
    .upsert({ id: "00000000-0000-0000-0000-000000000001" }, { onConflict: "id" });

  if (error) {
    console.error("❌  Failed:", error.message);
    process.exit(1);
  }

  console.log("✅  ecommerce_config row ready (sales window: null/null = always open)");
}

main();
