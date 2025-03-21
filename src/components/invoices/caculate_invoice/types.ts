export interface Account {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
}

export interface ResourcePosition {
  id: string
  name: string
  sowId: string
  projectId: string
  hourlyRate?: number
  monthlyRate?: number
}

export interface ResourceAllocation {
  id: string
  positionId: string
  employeeId: string
  sowId: string
  startDate: string
  endDate: string
}

export interface Timesheet {
  id: string
  allocationId: string
  date: string
  hours: number
  isHoliday: boolean
}

export interface Employee {
  id: string
  name: string
}

export interface InvoiceSchedule {
  id: string
  sowId: string
  issue_date: string
  isBilled: boolean
}

export interface InvoiceScheduleCaculate extends InvoiceSchedule {
  startDate: string
  endDate: string
}

export interface SOW {
  id: string
  name: string
  type: "T&M" | "FIXED PRICE" | "MAINTENANCE"
  startDate: string
  endDate: string
  billing_cycle_type?: string
  projectIds: string[]
  currency_code: string
  invoiceSchedules: InvoiceSchedule[]
  resourcePositions: ResourcePosition[]
}

export interface SOWCaculate {
  id: string
  name: string
  type: "T&M" | "FIXED PRICE" | "MAINTENANCE"
  startDate: string
  endDate: string
  billing_cycle_type?: string
  projectIds: string[]
  currency_code: string
  invoiceSchedules: InvoiceScheduleCaculate[]
  resourcePositions: ResourcePosition[]
}

export interface AdjustmentItem {
  employee: Employee
  position: string
  plannedHours: number
  actualHours: number
  variance: number
  adjustment: number
  rate: number
}

export interface InvoiceEmployee {
  name: string
  code_unit: string
  salary: number
  position: string
}

export interface InvoicePosition {
  code_unit: string
  monthlyRate: number
  position: string
}
