import { CurrencyCodeEnum } from "@/types/common"
import { ResourcePositionEnum, TypeOfSowEnum } from "@/types/sow"
import { createListCollection } from "@chakra-ui/react"

export const resourcePosition = createListCollection({
  items: [
    {
      value: ResourcePositionEnum.DEVELOPER,
      label: "Developer (Dev)",
    },
    {
      value: ResourcePositionEnum.PM,
      label: "Project Manager (PM)",
    },
    {
      value: ResourcePositionEnum.UX_UI,
      label: "UI/UX Designer",
    },
    {
      value: ResourcePositionEnum.BA,
      label: "Business Analyst (BA)",
    },
    {
      value: ResourcePositionEnum.QA,
      label: "Quality Assurance (QA)",
    },
    {
      value: ResourcePositionEnum.DEV_OPS,
      label: "DevOps",
    },
  ],
})

export const currencyOptions = createListCollection({
  items: [
    {
      value: CurrencyCodeEnum.USD,
      label: CurrencyCodeEnum.USD,
      flag: "/assets/images/us.svg",
    },
    {
      value: CurrencyCodeEnum.EUR,
      label: CurrencyCodeEnum.EUR,
      flag: "/assets/images/eu.svg",
    },
    {
      value: CurrencyCodeEnum.JPY,
      label: CurrencyCodeEnum.JPY,
      flag: "/assets/images/jp.svg",
    },
    {
      value: CurrencyCodeEnum.VND,
      label: CurrencyCodeEnum.VND,
      flag: "/assets/images/vn.svg",
    },
  ],
})

export const typeSowOptions = createListCollection({
  items: [
    {
      value: TypeOfSowEnum.T_M,
      label: TypeOfSowEnum.T_M,
    },
    {
      value: TypeOfSowEnum.MAINTENANCE,
      label: TypeOfSowEnum.MAINTENANCE,
    },
    {
      value: TypeOfSowEnum.FIXED_PRICE,
      label: TypeOfSowEnum.FIXED_PRICE,
    },
  ],
})

export const invoiceBillingCycle = createListCollection({
  items: [
    {
      value: "monthly",
      label: "Monthly",
    },
    {
      value: "custom",
      label: "Custom",
    },
  ],
})

export const cssScrollBar = {
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "gray.400",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
}
