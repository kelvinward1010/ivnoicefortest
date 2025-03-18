import { CurrencyCodeEnum } from "@/types/common"
import { ProjectStatusEnum } from "@/types/project"
import { createListCollection } from "@chakra-ui/react"

export const listStatus = createListCollection({
  items: [
    {
      value: ProjectStatusEnum.DRAFT,
      label: "Draft",
    },
    {
      value: ProjectStatusEnum.BIDDING,
      label: "Bidding",
    },
    {
      value: ProjectStatusEnum.RUNNING,
      label: "Running",
    },
    {
      value: ProjectStatusEnum.DONE,
      label: "Done",
    },
    {
      value: ProjectStatusEnum.ON_HOLD,
      label: "On Hold",
    },
    {
      value: ProjectStatusEnum.CANCELLED,
      label: "Cancelled",
    },
  ],
})

export const listCurrencyCode = createListCollection({
  items: [
    {
      value: CurrencyCodeEnum.EUR,
      label: CurrencyCodeEnum.EUR,
      avatar: "./assets/images/eu.svg",
    },
    {
      value: CurrencyCodeEnum.JPY,
      label: CurrencyCodeEnum.JPY,
      avatar: "./assets/images/jp.svg",
    },
    {
      value: CurrencyCodeEnum.USD,
      label: CurrencyCodeEnum.USD,
      avatar: "./assets/images/us.svg",
    },
    {
      value: CurrencyCodeEnum.VND,
      label: CurrencyCodeEnum.VND,
      avatar: "./assets/images/vn.svg",
    },
  ],
  itemToString: (item) => item.value,
  itemToValue: (item) => item.value,
})

type StatusStyle = {
  backgroundColor: string
  textColor: string
  label: string
}

export const statusStyles: Record<ProjectStatusEnum, StatusStyle> = {
  [ProjectStatusEnum.DRAFT]: {
    backgroundColor: "#D3D3D3",
    textColor: "#4D4D4D",
    label: "Draft",
  },
  [ProjectStatusEnum.BIDDING]: {
    backgroundColor: "#FAF0BE",
    textColor: "#B8860B",
    label: "Bidding",
  },
  [ProjectStatusEnum.RUNNING]: {
    backgroundColor: "#C8E6C9",
    textColor: "#2E7D32",
    label: "Running",
  },
  [ProjectStatusEnum.DONE]: {
    backgroundColor: "#BBDEFB",
    textColor: "#0D47A1",
    label: "Done",
  },
  [ProjectStatusEnum.ON_HOLD]: {
    backgroundColor: "#E1BEE7",
    textColor: "#6A1B9A",
    label: "On Hold",
  },
  [ProjectStatusEnum.CANCELLED]: {
    backgroundColor: "#FFCDD2",
    textColor: "#D32F2F",
    label: "Cancelled",
  },
}

export const statusRules = {
  DRAFT: [ProjectStatusEnum.BIDDING, ProjectStatusEnum.DRAFT],
  BIDDING: [
    ProjectStatusEnum.DRAFT,
    ProjectStatusEnum.CANCELLED,
    ProjectStatusEnum.ON_HOLD,
    ProjectStatusEnum.RUNNING,
    ProjectStatusEnum.BIDDING,
  ],
  RUNNING: [ProjectStatusEnum.DONE, ProjectStatusEnum.RUNNING],
  CANCELLED: [ProjectStatusEnum.BIDDING, ProjectStatusEnum.CANCELLED],
  ON_HOLD: [
    ProjectStatusEnum.BIDDING,
    ProjectStatusEnum.ON_HOLD,
    ProjectStatusEnum.CANCELLED,
  ],
  DONE: [ProjectStatusEnum.RUNNING, ProjectStatusEnum.DONE],
}
