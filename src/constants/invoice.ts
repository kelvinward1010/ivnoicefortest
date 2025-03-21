export enum InvoiceStatusEnum {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  UNPAID = "UNPAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export const OPTIONCACULATE: { label: string; value: "NORMAL" | "FUTURE" }[] = [
  { label: "Normal Calculation", value: "NORMAL" },
  { label: "Future Adjustment", value: "FUTURE" },
]

export const OPTIONVIEWMODETIME: { label: string; value: "hours" | "days" }[] =
  [
    { label: "Hours", value: "hours" },
    { label: "Days", value: "days" },
  ]
