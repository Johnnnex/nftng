import { redirect } from "next/navigation";

export default function LogisticsRoot() {
  redirect("/admin/logistics/items");
}
