"use client";
import { useEffect } from "react";
import { usePreviewOrderStore } from "@/store";

type Result = { data: any } | null;

export function PreviewOrderInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    usePreviewOrderStore.setState({ order: results[0]?.data ?? null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
