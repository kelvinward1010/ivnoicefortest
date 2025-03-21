import { CurrencyCodeEnum, currencyLocaleMap } from "@/types/common"
import type {
  InvoiceSchedule,
  InvoiceScheduleCaculate,
  ResourceAllocation,
  SOW,
  SOWCaculate,
  Timesheet,
} from "./types"

export function isWithinInterval(
  date: Date,
  interval: { start: Date; end: Date },
): boolean {
  return date >= interval.start && date <= interval.end
}

export const generateSOWTimesheets = (
  sow: SOW,
  allocations: ResourceAllocation[],
): Timesheet[] => {
  const timesheets: Timesheet[] = []
  let idCounter = 1

  const isWorkday = (date: Date) => {
    const day = date.getDay()
    return day >= 1 && day <= 5
  }

  const generateHolidays = (startDate: Date, endDate: Date): Set<string> => {
    const holidays = new Set<string>()
    const totalHolidays = Math.floor(Math.random() * 5) + 1
    while (holidays.size < totalHolidays) {
      const randomDate = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime()),
      )

      if (isWorkday(randomDate)) {
        holidays.add(randomDate.toISOString().split("T")[0])
      }
    }

    return holidays
  }

  for (const alloc of allocations) {
    if (alloc.sowId !== sow.id) continue

    const start = new Date(alloc.startDate)
    const end = new Date(alloc.endDate)
    const holidays = generateHolidays(start, end)
    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0]

      if (isWorkday(current)) {
        const isHoliday = holidays.has(dateStr)

        timesheets.push({
          id: `ts${idCounter++}`,
          allocationId: alloc.id,
          date: dateStr,
          hours: isHoliday ? 0 : Math.floor(Math.random() * 9),
          isHoliday,
        })
      }

      current.setDate(current.getDate() + 1)
    }
  }

  return timesheets
}

export const getPublicHolidaysInSchedule = (
  schedule: InvoiceScheduleCaculate,
  detail: { timesheets: Timesheet[] },
) => {
  return detail.timesheets.filter(
    (ts) =>
      ts.isHoliday &&
      isWithinInterval(new Date(ts.date), {
        start: new Date(schedule.startDate),
        end: new Date(schedule.endDate),
      }),
  ).length
}

const PUBLIC_HOLIDAYS = [
  { date: "2025-01-01", name: "Tết Dương lịch" },
  { date: "2025-01-25", name: "Tết Nguyên Đán (Bắt đầu)" },
  { date: "2025-02-02", name: "Tết Nguyên Đán (Kết thúc)" },
  { date: "2025-04-07", name: "Giỗ Tổ Hùng Vương" },
  { date: "2025-04-30", name: "Ngày Giải phóng miền Nam" },
  { date: "2025-05-01", name: "Ngày Quốc tế Lao động" },
  { date: "2025-09-02", name: "Ngày Quốc khánh" },
]

export const getPublicHolidays = (
  schedule: InvoiceScheduleCaculate,
): Date[] => {
  const start = new Date(schedule.startDate)
  const end = new Date(schedule.endDate)

  return PUBLIC_HOLIDAYS.filter((holiday) => {
    const holidayDate = new Date(holiday.date)
    return holidayDate >= start && holidayDate <= end
  }).map((holiday) => new Date(holiday.date))
}
export const deepEqual = (obj1: any, obj2: any) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export const getMonthCount = (schedule: InvoiceScheduleCaculate): number => {
  const start = new Date(schedule.startDate)
  const end = new Date(schedule.endDate)
  if (start > end) return 0
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  const totalMonthDiff = yearDiff * 12 + monthDiff
  const endOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0)
  const daysInEndMonth = endOfMonth.getDate()
  const remainingDays = end.getDate() - start.getDate() + 1
  const fractionOfMonth = remainingDays / daysInEndMonth
  return totalMonthDiff + fractionOfMonth
}

export function getEarliestStartDate(selectedSOWs: SOWCaculate[]): string {
  if (selectedSOWs.length === 0) {
    throw new Error("Không có SOW nào được chọn để merge")
  }

  return selectedSOWs.reduce(
    (earliest, sow) =>
      new Date(sow.startDate) < new Date(earliest) ? sow.startDate : earliest,
    selectedSOWs[0].startDate,
  )
}

export function getLatestEndDate(selectedSOWs: SOWCaculate[]): string {
  if (selectedSOWs.length === 0) {
    throw new Error("Không có SOW nào được chọn để merge")
  }

  return selectedSOWs.reduce(
    (latest, sow) =>
      new Date(sow.endDate) > new Date(latest) ? sow.endDate : latest,
    selectedSOWs[0].endDate,
  )
}

export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCodeEnum,
) => {
  return new Intl.NumberFormat(currencyLocaleMap[currencyCode], {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits:
      currencyCode === CurrencyCodeEnum.VND ||
      currencyCode === CurrencyCodeEnum.JPY
        ? 0
        : 2,
  }).format(amount)
}

const getBillingPeriod = (
  sow: SOW,
  schedule: InvoiceSchedule,
  prevSchedule: InvoiceSchedule | null,
  calculationMode: "NORMAL" | "FUTURE",
) => {
  const issueDate = new Date(schedule.issue_date)
  const sowStart = new Date(sow.startDate)
  const sowEnd = new Date(sow.endDate)

  let periodStart: Date
  let periodEnd: Date

  const getNextStartDate = (prevEndDate: Date) => {
    const date = new Date(prevEndDate)
    date.setDate(date.getDate() + 1)
    return date
  }

  switch (sow.billing_cycle_type) {
    case "ENDOFMONTH":
    case "MONTHLY":
    case "CUSTOM":
      if (calculationMode === "NORMAL" || calculationMode === "FUTURE") {
        periodStart = prevSchedule
          ? getNextStartDate(new Date(prevSchedule.issue_date))
          : new Date(sowStart)
        periodEnd = new Date(issueDate)
      } else {
        periodStart = new Date(sowStart)
        periodEnd = new Date(sowEnd)
      }
      break

    default:
      periodStart = prevSchedule
        ? getNextStartDate(new Date(prevSchedule.issue_date))
        : new Date(sowStart)
      periodEnd = new Date(issueDate)
  }

  return {
    startDate: periodStart < sowStart ? sowStart : periodStart,
    endDate: periodEnd > sowEnd ? sowEnd : periodEnd,
  }
}

export const processSOWs = (
  sows: SOW[],
  calculationMode: "NORMAL" | "FUTURE",
  options: { returnUpdatedSOWS?: boolean } = {},
): { schedules: InvoiceScheduleCaculate[]; updatedSOWS?: SOWCaculate[] } => {
  const allSchedules: InvoiceScheduleCaculate[] = []
  const updatedSOWS: SOWCaculate[] = []

  for (const sow of sows) {
    const periods: Array<{ startDate: Date; endDate: Date }> = []
    const sortedSchedules = [...sow.invoiceSchedules].sort(
      (a, b) =>
        new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime(),
    )

    if (sortedSchedules.length > 0) {
      const firstPeriod = getBillingPeriod(
        sow,
        sortedSchedules[0],
        null,
        calculationMode,
      )
      if (new Date(sow.startDate) < firstPeriod.startDate) {
        periods.push({
          startDate: new Date(sow.startDate),
          endDate: new Date(firstPeriod.startDate),
        })
      }
    }

    let prevSchedule: InvoiceScheduleCaculate | null = null
    for (const schedule of sortedSchedules) {
      const period = getBillingPeriod(
        sow,
        schedule,
        prevSchedule,
        calculationMode,
      )
      periods.push(period)
      prevSchedule = schedule as InvoiceScheduleCaculate
    }

    const lastPeriod = periods[periods.length - 1]
    if (lastPeriod.endDate < new Date(sow.endDate)) {
      periods.push({
        startDate: new Date(lastPeriod.endDate),
        endDate: new Date(sow.endDate),
      })
    }

    const validPeriods = periods.filter((p) => p.startDate <= p.endDate)

    const existingSchedulesMap = new Map(
      sow.invoiceSchedules.map((s) => [s.issue_date, s]),
    )
    const mergedSchedules = validPeriods.map((period) => {
      const periodEndDate = period.endDate.toISOString().split("T")[0]
      const existing = existingSchedulesMap.get(periodEndDate)

      const newSchedule: InvoiceScheduleCaculate = existing
        ? {
            ...existing,
            startDate: period.startDate.toISOString().split("T")[0],
            endDate: periodEndDate,
          }
        : {
            id: `gen-${sow.id}-${periodEndDate}`,
            sowId: sow.id,
            startDate: period.startDate.toISOString().split("T")[0],
            endDate: periodEndDate,
            issue_date: periodEndDate,
            isBilled: false,
          }

      allSchedules.push(newSchedule)
      return newSchedule
    })

    if (options.returnUpdatedSOWS) {
      updatedSOWS.push({
        ...sow,
        invoiceSchedules: mergedSchedules,
      })
    }
  }

  const sortedSchedules = allSchedules.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  return options.returnUpdatedSOWS
    ? { schedules: sortedSchedules, updatedSOWS }
    : { schedules: sortedSchedules }
}
