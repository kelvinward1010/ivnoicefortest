import { CurrencyCodeEnum } from "@/types/common"
import { createListCollection } from "@chakra-ui/react"
import { generateSOWTimesheets } from "./helper"
import type {
  Account,
  Employee,
  InvoiceSchedule,
  Project,
  ResourceAllocation,
  ResourcePosition,
  SOW,
} from "./types"

export const accounts = createListCollection<Account>({
  items: [
    { id: "acc1", name: "Công ty Công nghệ A" },
    { id: "acc2", name: "Tập đoàn Xây dựng B" },
    { id: "acc3", name: "Startup Fintech C" },
    { id: "acc4", name: "Công ty Y tế D" },
    { id: "acc5", name: "Tổ chức Giáo dục E" },
    { id: "acc6", name: "Doanh nghiệp Logistics F" },
  ],
})

export const projectsData: Record<string, Project[]> = {
  acc1: [
    { id: "proj1", name: "Hệ thống ERP" },
    { id: "proj2", name: "Mobile App - Health Tracking" },
    { id: "proj3", name: "AI Chatbot Platform" },
    { id: "proj7", name: "IoT Smart Factory" },
  ],
  acc2: [
    { id: "proj4", name: "Tòa nhà thông minh - Green Energy" },
    { id: "proj5", name: "Hệ thống điện thế hệ mới" },
    { id: "proj8", name: "Cầu đường bộ cao tốc" },
  ],
  acc3: [
    { id: "proj6", name: "Nền tảng Payment Gateway" },
    { id: "proj9", name: "Blockchain Wallet System" },
  ],
  acc4: [
    { id: "proj10", name: "Hệ thống quản lý bệnh viện" },
    { id: "proj11", name: "App đặt lịch khám online" },
  ],
  acc5: [
    { id: "proj12", name: "Hệ thống E-Learning" },
    { id: "proj13", name: "Ứng dụng học tiếng Anh AI" },
  ],
  acc6: [
    { id: "proj14", name: "Hệ thống quản lý kho vận" },
    { id: "proj15", name: "App tracking vận chuyển" },
  ],
}

export const employees: Employee[] = [
  { id: "emp1", name: "Nguyễn Văn A" },
  { id: "emp2", name: "Trần Thị B" },
  { id: "emp3", name: "Lê Văn C" },
  { id: "emp4", name: "Phạm Thị D" },
  { id: "emp5", name: "Hoàng Văn E" },
  { id: "emp6", name: "Vũ Thị F" },
  { id: "emp7", name: "Đặng Văn G" },
  { id: "emp8", name: "Bùi Thị H" },
]

export const resourcePositionsData: ResourcePosition[] = [
  {
    id: "pos1",
    name: "Fullstack Dev",
    sowId: "sow1",
    projectId: "proj1",
    hourlyRate: 120000,
  },
  {
    id: "pos2",
    name: "Mobile Dev",
    sowId: "sow1",
    projectId: "proj2",
    monthlyRate: 110000 * 8 * 20,
  },
  {
    id: "pos3",
    name: "AI Engineer",
    sowId: "sow2",
    projectId: "proj3",
    monthlyRate: 150000 * 8 * 20,
  },
  {
    id: "pos4",
    name: "Civil Engineer",
    sowId: "sow3",
    projectId: "proj4",
    hourlyRate: 200,
    monthlyRate: 200000 * 8 * 20,
  },
  {
    id: "pos5",
    name: "Electrical Engineer",
    sowId: "sow4",
    projectId: "proj5",
    hourlyRate: 180,
    monthlyRate: 180000 * 8 * 20,
  },
  {
    id: "pos6",
    name: "DevOps Engineer",
    sowId: "sow5",
    projectId: "proj7",
    hourlyRate: 130000,
    monthlyRate: 130000 * 8 * 20,
  },
  {
    id: "pos7",
    name: "QA Lead",
    sowId: "sow6",
    projectId: "proj10",
    hourlyRate: 100000,
    monthlyRate: 100000 * 8 * 20,
  },
  {
    id: "pos8",
    name: "Blockchain Developer",
    sowId: "sow7",
    projectId: "proj9",
    hourlyRate: 170000,
    monthlyRate: 170000 * 8 * 20,
  },
]

export const invoiceSchedules: InvoiceSchedule[] = [
  {
    id: "sched1",
    sowId: "sow1",
    issue_date: "2023-10-25",
    isBilled: true,
  },
  {
    id: "sched2",
    sowId: "sow1",
    issue_date: "2023-11-25",
    isBilled: false,
  },
  {
    id: "sched3",
    sowId: "sow1",
    issue_date: "2023-12-25",
    isBilled: false,
  },
  {
    id: "sched4",
    sowId: "sow2",
    issue_date: "2024-04-27",
    isBilled: false,
  },
  {
    id: "sched5",
    sowId: "sow2",
    issue_date: "2024-05-29",
    isBilled: false,
  },
  {
    id: "sched6",
    sowId: "sow4",
    issue_date: "2023-10-25",
    isBilled: false,
  },
  {
    id: "sched7",
    sowId: "sow4",
    issue_date: "2023-11-25",
    isBilled: false,
  },
  {
    id: "sched8",
    sowId: "sow5",
    issue_date: "2024-05-01",
    isBilled: false,
  },
  {
    id: "sched9",
    sowId: "sow5",
    issue_date: "2024-09-01",
    isBilled: false,
  },
  {
    id: "sched10",
    sowId: "sow7",
    issue_date: "2024-02-25",
    isBilled: false,
  },
]

export const sowsData: SOW[] = [
  {
    id: "sow1",
    name: "Giai đoạn 1 - Phát triển core",
    type: "T&M",
    projectIds: ["proj1"],
    startDate: "2023-10-10",
    endDate: "2024-01-05",
    billing_cycle_type: "MONTHLY",
    currency_code: CurrencyCodeEnum.EUR,
    invoiceSchedules: invoiceSchedules.filter((s) => s.sowId === "sow1"),
    resourcePositions: resourcePositionsData.filter((s) => s.sowId === "sow1"),
  },
  {
    id: "sow2",
    name: "Giai đoạn 2 - Bảo trì",
    type: "MAINTENANCE",
    projectIds: ["proj1"],
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    billing_cycle_type: "ENDOFMONTH",
    currency_code: CurrencyCodeEnum.USD,
    invoiceSchedules: invoiceSchedules.filter((s) => s.sowId === "sow2"),
    resourcePositions: resourcePositionsData.filter((s) => s.sowId === "sow2"),
  },

  {
    id: "sow3",
    name: "Thiết kế hệ thống tòa nhà thông minh",
    type: "FIXED PRICE",
    startDate: "2023-11-01",
    endDate: "2024-06-30",
    projectIds: ["proj4"],
    billing_cycle_type: "MONTHLY",
    currency_code: CurrencyCodeEnum.JPY,
    invoiceSchedules: invoiceSchedules.filter((s) => s.sowId === "sow3"),
    resourcePositions: resourcePositionsData.filter((s) => s.sowId === "sow3"),
  },

  {
    id: "sow4",
    name: "ADD NEW TECH",
    type: "FIXED PRICE",
    startDate: "2023-11-01",
    endDate: "2024-06-30",
    projectIds: ["proj5"],
    billing_cycle_type: "MONTHLY",
    currency_code: CurrencyCodeEnum.EUR,
    invoiceSchedules: invoiceSchedules.filter((s) => s.sowId === "sow4"),
    resourcePositions: resourcePositionsData.filter((s) => s.sowId === "sow4"),
  },
  {
    id: "sow5",
    name: "Bảo trì hệ thống DevOps",
    type: "MAINTENANCE",
    projectIds: ["proj7", "proj12"],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    billing_cycle_type: "CUSTOM",
    currency_code: CurrencyCodeEnum.EUR,
    invoiceSchedules: invoiceSchedules.filter((s) => s.sowId === "sow5"),
    resourcePositions: resourcePositionsData.filter((s) => s.sowId === "sow5"),
  },
]

export const resourceAllocations: ResourceAllocation[] = [
  {
    id: "alloc1",
    positionId: "pos1",
    employeeId: "emp1",
    sowId: "sow1",
    startDate: "2023-10-01",
    endDate: "2024-03-31",
  },
  {
    id: "alloc2",
    positionId: "pos2",
    employeeId: "emp2",
    sowId: "sow1",
    startDate: "2023-10-15",
    endDate: "2024-02-28",
  },
  {
    id: "alloc3",
    positionId: "pos3",
    employeeId: "emp3",
    sowId: "sow2",
    startDate: "2023-11-01",
    endDate: "2024-01-31",
  },
  {
    id: "allocx",
    positionId: "pos5",
    employeeId: "emp3",
    sowId: "sow4",
    startDate: "2023-11-01",
    endDate: "2024-01-31",
  },
  {
    id: "alloc4",
    positionId: "pos6",
    employeeId: "emp4",
    sowId: "sow5",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
  },
  {
    id: "alloc5",
    positionId: "pos8",
    employeeId: "emp6",
    sowId: "sow7",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
  },
]

export const timesheetsData = sowsData.flatMap((sow) =>
  generateSOWTimesheets(sow, resourceAllocations),
)
