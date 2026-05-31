import type { Metadata } from "next";
import { BASE_ROBOTS } from "@/lib";
import EditProductPage from "./EditProductPage";

export const metadata: Metadata = {
  title: "Edit Product | NFTNG Admin",
  robots: { index: false, follow: false },
};

export default EditProductPage;
