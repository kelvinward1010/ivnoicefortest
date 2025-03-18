import { CurrencyCodeEnum, currencyLocaleMap } from "@/types/common"
import {
  type InvoiceSchedule,
  type ResourceAllocation,
  type SOW,
  type Timesheet,
  isWithinInterval,
} from "."

export const generateSOWTimesheets = (
  sow: SOW,
  allocations: ResourceAllocation[],
): Timesheet[] => {
  const timesheets: Timesheet[] = []
  let idCounter = 1

  const isWorkday = (date: Date) => {
    const day = date.getDay()
    return day >= 1 && day <= 5 // Chỉ lấy thứ 2 - thứ 6
  }

  const generateHolidays = (startDate: Date, endDate: Date): Set<string> => {
    const holidays = new Set<string>()
    const totalHolidays = Math.floor(Math.random() * 5) + 1 // 1 -> 5 ngày nghỉ lễ trong khoảng startDate - endDate

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
    const holidays = generateHolidays(start, end) // Tạo ngày nghỉ lễ theo đúng khoảng thời gian

    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0]

      if (isWorkday(current)) {
        const isHoliday = holidays.has(dateStr)

        timesheets.push({
          id: `ts${idCounter++}`,
          allocationId: alloc.id,
          date: dateStr,
          hours: isHoliday ? 0 : Math.floor(Math.random() * 9), // Giờ làm từ 0 -> 8
          isHoliday,
        })
      }

      current.setDate(current.getDate() + 1)
    }
  }

  return timesheets
}

export const getPublicHolidaysInSchedule = (
  schedule: InvoiceSchedule,
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

export function getEarliestStartDate(selectedSOWs: SOW[]): string {
  return selectedSOWs.reduce((earliest, sow) => {
    return new Date(sow.startDate) < new Date(earliest)
      ? sow.startDate
      : earliest
  }, selectedSOWs[0].startDate)
}

export function getLatestEndDate(selectedSOWs: SOW[]): string {
  return selectedSOWs.reduce((latest, sow) => {
    return new Date(sow.endDate) > new Date(latest) ? sow.endDate : latest
  }, selectedSOWs[0].endDate)
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
