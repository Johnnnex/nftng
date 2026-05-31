import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
  config({ path: ".env" });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const existing = await supabase.from("admins").select("id").eq("email", email).maybeSingle();
  if (existing.data) {
    console.log("Super admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: admin, error } = await supabase
    .from("admins")
    .insert({
      email,
      password_hash: passwordHash,
      first_name: "Super",
      last_name: "Admin",
      is_super: true,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !admin) {
    console.error("Failed to seed super admin:", error?.message);
    process.exit(1);
  }

  const { error: configError } = await supabase.from("admin_configs").insert({
    admin_id: admin.id,
    module_permissions: {},
  });

  if (configError) {
    console.error("Failed to create admin config:", configError.message);
    process.exit(1);
  }

  console.log("Super admin seeded successfully:", email);
}

main();
