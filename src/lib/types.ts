export const RoleValues = {
  CUSTOMER: "CUSTOMER",
  FIRM: "FIRM",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof RoleValues)[keyof typeof RoleValues];
export const DesignerStatusValues = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type DesignerStatus = (typeof DesignerStatusValues)[keyof typeof DesignerStatusValues];
export const ProjectStatusValues = {
  LEAD: "LEAD",
  REQUESTED: "REQUESTED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type ProjectStatus = (typeof ProjectStatusValues)[keyof typeof ProjectStatusValues];
export const MilestoneStatusValues = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  DISPUTED: "DISPUTED",
} as const;
export type MilestoneStatus = (typeof MilestoneStatusValues)[keyof typeof MilestoneStatusValues];
export const PaymentStatusValues = {
  PENDING: "PENDING",
  HELD: "HELD",
  RELEASED: "RELEASED",
  CANCELLED: "CANCELLED",
} as const;
export type PaymentStatus = (typeof PaymentStatusValues)[keyof typeof PaymentStatusValues];
export const PaymentTypeValues = {
  ADVANCE: "ADVANCE",
  MILESTONE: "MILESTONE",
  DIGITAL_TWIN_RENEWAL: "DIGITAL_TWIN_RENEWAL",
  FIRM_YEARLY_FEE: "FIRM_YEARLY_FEE",
  CUSTOMER_REGISTRATION_FEE: "CUSTOMER_REGISTRATION_FEE",
  FIRM_REGISTRATION_FEE: "FIRM_REGISTRATION_FEE",
  ADDITIONAL_PROJECT_FEE: "ADDITIONAL_PROJECT_FEE",
} as const;
export type PaymentType = (typeof PaymentTypeValues)[keyof typeof PaymentTypeValues];
export const NotificationTypeValues = {
  FIRM_APPROVED: "FIRM_APPROVED",
  PROJECT_REQUEST: "PROJECT_REQUEST",
  MILESTONE_SUBMITTED: "MILESTONE_SUBMITTED",
  MILESTONE_APPROVED: "MILESTONE_APPROVED",
  PAYMENT_RELEASED: "PAYMENT_RELEASED",
  MILESTONE_DISPUTED: "MILESTONE_DISPUTED",
} as const;
export type NotificationType = (typeof NotificationTypeValues)[keyof typeof NotificationTypeValues];
export const DigitalTwinCategoryValues = {
  WIRING: "WIRING",
  PLUMBING: "PLUMBING",
  FLOOR_PLAN: "FLOOR_PLAN",
  HANDOVER: "HANDOVER",
  OTHER: "OTHER",
} as const;
export type DigitalTwinCategory =
  (typeof DigitalTwinCategoryValues)[keyof typeof DigitalTwinCategoryValues];
export const SubscriptionStatusValues = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
} as const;
export type SubscriptionStatus =
  (typeof SubscriptionStatusValues)[keyof typeof SubscriptionStatusValues];

export const Roles: Role[] = Object.values(RoleValues);
