import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  FolderKanban,
  CreditCard,
  Settings,
  MapPin,
  Building2,
  MessageSquare,
  Sparkles,
  Layers,
  User,
  Palette,
  IndianRupee,
  Menu,
} from "lucide-react";

export type AppRole = "admin" | "customer" | "designer";

export type NavItem = {
  href: string;
  label: string;
  /** Short label for mobile bottom nav (e.g. "Home" instead of "Dashboard") */
  shortLabel?: string;
  icon: LucideIcon;
  /** If true, bottom nav shows "More" button that opens drawer instead of direct link (admin only) */
  isMore?: boolean;
};

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/designers", label: "Designer Approvals", icon: BadgeCheck },
  { href: "/admin/designers-pending-payment", label: "Pending Subscription", icon: IndianRupee },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/pricing", label: "AI Estimator Pricing", icon: MapPin },
  { href: "/admin/trusted-studios", label: "Trusted Studios", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const CUSTOMER_NAV: NavItem[] = [
  { href: "/customer/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/designers", label: "Browse Designers", shortLabel: "Designers", icon: Palette },
  { href: "/customer/estimator", label: "AI Cost Estimator", shortLabel: "AI Estimate", icon: Sparkles },
  { href: "/customer/payments", label: "Payment History", shortLabel: "Payments", icon: CreditCard },
  { href: "/customer/digital-twin", label: "Digital Twin", shortLabel: "Twin", icon: Layers },
];

const DESIGNER_NAV: NavItem[] = [
  { href: "/designer/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/designer/leads", label: "Leads", icon: MessageSquare },
  { href: "/designer/projects", label: "Projects", icon: FolderKanban },
  { href: "/designer/payments", label: "Payments", shortLabel: "Payments", icon: CreditCard },
  { href: "/designer/profile", label: "Profile", icon: User },
];

/** Admin mobile bottom: first 4 links + "More" (opens drawer with full nav) */
const ADMIN_BOTTOM: NavItem[] = [
  ...ADMIN_NAV.slice(0, 4),
  { href: "#", label: "More", shortLabel: "More", icon: Menu, isMore: true },
];

export const APP_NAV: Record<AppRole, NavItem[]> = {
  admin: ADMIN_NAV,
  customer: CUSTOMER_NAV,
  designer: DESIGNER_NAV,
};

/** For mobile bottom bar: admin gets 4 + More, customer/designer get all items */
export const APP_NAV_MOBILE: Record<AppRole, NavItem[]> = {
  admin: ADMIN_BOTTOM,
  customer: CUSTOMER_NAV,
  designer: DESIGNER_NAV,
};
