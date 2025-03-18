export enum CurrencyCodeEnum {
  USD = "USD",
  JPY = "JPY",
  EUR = "EUR",
  VND = "VND",
}

export const currencyLocaleMap: Record<CurrencyCodeEnum, string> = {
  USD: "en-US",
  JPY: "ja-JP",
  EUR: "de-DE",
  VND: "vi-VN",
}

export enum RolesEnum {
  ACCOUNT_MANAGER = "AM",
  PROJECT_MANAGER = "PM",
  RELATIONSHIP_MANAGEMENT_OFFICE = "RMO",
}
