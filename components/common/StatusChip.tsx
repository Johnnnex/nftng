type ItemStatus = "pending" | "packaged" | "enroute" | "delivered" | "returned";
type OrderStatus = "pending_payment" | "paid" | "in_progress" | "complete" | "cancelled" | "refunded";
type AdminStatus = "active" | "inactive";

type StatusChipStatus = ItemStatus | OrderStatus | AdminStatus;

const CHIP_CONFIG: Record<StatusChipStatus, { label: string; bg: string; text: string; dot: string }> = {
  // item statuses (DB item_status enum)
  pending:     { label: "Confirmed",   bg: "#F0FDF4", text: "#166534", dot: "#6EC93E"  },
  packaged:    { label: "Packaged",    bg: "#FFF7ED", text: "#C2410C", dot: "#F97316"  },
  enroute:     { label: "En Route",    bg: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6"  },
  delivered:   { label: "Delivered",   bg: "#F0FDF4", text: "#166534", dot: "#6EC93E"  },
  returned:    { label: "Returned",    bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444"  },
  // order statuses (DB order_status enum)
  pending_payment: { label: "Pending Payment", bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
  paid:            { label: "Paid",            bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  in_progress:     { label: "In Progress",     bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
  complete:        { label: "Complete",        bg: "#F0FDF4", text: "#166534", dot: "#6EC93E" },
  cancelled:       { label: "Cancelled",       bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444" },
  refunded:        { label: "Refunded",        bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  // admin statuses
  active:   { label: "Active",   bg: "#F0FDF4", text: "#166534", dot: "#6EC93E" },
  inactive: { label: "Inactive", bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
};

type StatusChipProps = {
  status: StatusChipStatus;
  className?: string;
};

const StatusChip = ({ status, className = "" }: StatusChipProps) => {
  const config = CHIP_CONFIG[status] ?? { label: status, bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-medium whitespace-nowrap ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: config.dot }} />
      {config.label}
    </span>
  );
};

export { StatusChip };
export type { StatusChipStatus, ItemStatus, OrderStatus, AdminStatus };
