import { cn } from "@/lib";

const IconBone = () => (
  <div className="w-5 h-5 rounded-md bg-[#1A2A1A] animate-pulse shrink-0" />
);

const LabelBone = ({ width }: { width: string }) => (
  <div className={cn("h-3 rounded-full bg-[#1A2A1A] animate-pulse", width)} />
);

const ChevronBone = () => (
  <div className="w-3 h-3 rounded-full bg-[#1A2A1A] animate-pulse ml-auto shrink-0" />
);

// Mirrors the real nav item structure — icon + label (+ optional chevron for groups)
const NavItemBone = ({
  collapsed,
  labelWidth,
  hasChevron = false,
}: {
  collapsed: boolean;
  labelWidth: string;
  hasChevron?: boolean;
}) => (
  <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg", collapsed && "justify-center px-0")}>
    <IconBone />
    {!collapsed && (
      <>
        <LabelBone width={labelWidth} />
        {hasChevron && <ChevronBone />}
      </>
    )}
  </div>
);

// A child item inside an accordion (indented, narrower label)
const ChildItemBone = ({ labelWidth }: { labelWidth: string }) => (
  <div className="flex items-center gap-2 py-1.5 px-2 rounded-md ml-4 pl-3">
    <LabelBone width={labelWidth} />
  </div>
);

export const NavSkeleton = ({ collapsed }: { collapsed: boolean }) => (
  <>
    {/* Dashboard */}
    <NavItemBone collapsed={collapsed} labelWidth="w-20" />

    {/* Products */}
    <NavItemBone collapsed={collapsed} labelWidth="w-16" />

    {/* Orders */}
    <NavItemBone collapsed={collapsed} labelWidth="w-14" />

    {/* Logistics (accordion — has chevron, shows children when expanded) */}
    <NavItemBone collapsed={collapsed} labelWidth="w-20" hasChevron />
    {!collapsed && (
      <div className="ml-4 flex flex-col gap-0.5 border-l border-[#1f2937] pl-3">
        <ChildItemBone labelWidth="w-20" />
        <ChildItemBone labelWidth="w-12" />
        <ChildItemBone labelWidth="w-28" />
        <ChildItemBone labelWidth="w-24" />
      </div>
    )}

    {/* Registrations */}
    <NavItemBone collapsed={collapsed} labelWidth="w-24" />

    {/* Super nav section */}
    <div className={cn("mt-auto pt-2 border-t border-[#161B22]", collapsed ? "mx-0" : "mx-1")}>
      <NavItemBone collapsed={collapsed} labelWidth="w-32" />
    </div>
  </>
);
