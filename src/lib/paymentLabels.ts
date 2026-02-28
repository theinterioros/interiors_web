/** Human-readable label for payment ledger type (for display in admin, designer, customer ledgers). */
export function paymentTypeLabel(type: string): string {
  switch (type) {
    case "MILESTONE":
      return "Milestone payment";
    case "CUSTOMER_REGISTRATION_FEE":
      return "Customer registration (platform)";
    case "ADDITIONAL_PROJECT_FEE":
      return "Additional project slot";
    case "FIRM_REGISTRATION_FEE":
      return "Designer subscription (platform)";
    case "DIGITAL_TWIN_RENEWAL":
      return "Digital Twin renewal";
    case "FIRM_YEARLY_FEE":
      return "Designer yearly fee";
    case "ADVANCE":
      return "Advance";
    default:
      return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
