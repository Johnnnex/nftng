type ItemStatus = "paid" | "packaged" | "on_delivery" | "at_destination" | "delivered";
type OrderStatus = "pending_payment" | "paid" | "in_progress" | "complete" | "cancelled";
type AdminStatus = "active" | "inactive";

type StatusChipStatus = ItemStatus | OrderStatus | AdminStatus;

const CHIP_CONFIG: Record<StatusChipStatus, { label: string; bg: string; text: string; dot: string }> = {
  paid: { label: "Paid", bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  packaged: { label: "Packaged", bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  on_delivery: { label: "On Delivery", bg: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6" },
  at_destination: { label: "At Destination", bg: "#F0FDFA", text: "#0F766E", dot: "#14B8A6" },
  delivered: { label: "Delivered", bg: "#F0FDF4", text: "#166534", dot: "#6EC93E" },
  pending_payment: { label: "Pending Payment", bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
  in_progress: { label: "In Progress", bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
  complete: { label: "Complete", bg: "#F0FDF4", text: "#166534", dot: "#6EC93E" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444" },
  active: { label: "Active", bg: "#F0FDF4", text: "#166534", dot: "#6EC93E" },
  inactive: { label: "Inactive", bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
};

type StatusChipProps = {
  status: StatusChipStatus;
  className?: string;
};

const StatusChip = ({ status, className = "" }: StatusChipProps) => {
  const config = CHIP_CONFIG[status];

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
