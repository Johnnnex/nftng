/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const ROLE_TEMPLATES = [
  {
    name: "Logistics Admin",
    module_permissions: {
      logistics: { read: true, write: true },
      products: { read: true, write: false },
    },
  },
  {
    name: "Products Admin",
    module_permissions: {
      products: { read: true, write: true },
    },
  },
  {
    name: "Registrations Viewer",
    module_permissions: {
      registrations: { read: true, write: false },
    },
  },
  {
    name: "Registrations Admin",
    module_permissions: {
      registrations: { read: true, write: true },
    },
  },
  {
    name: "Full Access",
    module_permissions: {
      products: { read: true, write: true },
      logistics: { read: true, write: true },
      registrations: { read: true, write: true },
    },
  },
  {
    name: "Read-Only",
    module_permissions: {
      products: { read: true, write: false },
      logistics: { read: true, write: false },
      registrations: { read: true, write: false },
    },
  },
];

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
  config({ path: ".env" });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("Seeding role templates...\n");

  for (const template of ROLE_TEMPLATES) {
    const { data: existing } = await supabase
      .from("admin_roles")
      .select("id")
      .eq("name", template.name)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ Already exists: ${template.name}`);
      continue;
    }

    const { error } = await supabase
      .from("admin_roles")
      .insert(template as any);
    if (error) {
      console.error(`  ✗ Failed: ${template.name} —`, error.message);
    } else {
      console.log(`  + Created: ${template.name}`);
    }
  }

  console.log("\nDone.");
}

main();
