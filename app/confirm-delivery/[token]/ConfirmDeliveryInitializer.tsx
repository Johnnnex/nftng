"use client";
import { useEffect } from "react";
import { useConfirmDeliveryStore } from "@/store";

type Result = { data: any } | null;

export function ConfirmDeliveryInitializer({ results }: { results: [Result] }) {
  useEffect(() => {
    useConfirmDeliveryStore.setState({ data: results[0]?.data ?? null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
