import InputSelect from "@/components/common/inputs/InputSelect"
import { CurrencyCodeEnum } from "@/types/common"
import { formatDate } from "@/utils"
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Input,
  Portal,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import React, { useCallback, useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import {
  formatCurrency,
  generateSOWTimesheets,
  getEarliestStartDate,
  getLatestEndDate,
  getPublicHolidaysInSchedule,
} from "./helper"

interface Account {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

interface ResourcePosition {
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
  yearsOfService: number
}

export interface InvoiceSchedule {
  id: string
  sowId: string
  startDate: string
  endDate: string
  isBilled: boolean
}

export interface SOW {
  id: string
  name: string
  type: "T&M" | "FIXED PRICE" | "MAINTENANCE"
  startDate: string
  endDate: string
  projectIds: string[]
  currency_code: string
  invoiceSchedules: InvoiceSchedule[]
  resourcePositions: ResourcePosition[]
}

export interface AttendanceRecord {
  employeeId: string
  scheduleId: string
  totalLeaveDays: number
  carriedOverLeave: number
}

const accounts = createListCollection<Account>({
  items: [
    { id: "acc1", name: "Công ty Công nghệ A" },
    { id: "acc2", name: "Tập đoàn Xây dựng B" },
    { id: "acc3", name: "Startup Fintech C" },
    { id: "acc4", name: "Công ty Y tế D" },
    { id: "acc5", name: "Tổ chức Giáo dục E" },
    { id: "acc6", name: "Doanh nghiệp Logistics F" },
  ],
})

const projectsData: Record<string, Project[]> = {
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

const employees: Employee[] = [
  { id: "emp1", name: "Nguyễn Văn A", yearsOfService: 6 },
  { id: "emp2", name: "Trần Thị B", yearsOfService: 4 },
  { id: "emp3", name: "Lê Văn C", yearsOfService: 10 },
  { id: "emp4", name: "Phạm Thị D", yearsOfService: 7 },
  { id: "emp5", name: "Hoàng Văn E", yearsOfService: 2 },
  { id: "emp6", name: "Vũ Thị F", yearsOfService: 4 },
  { id: "emp7", name: "Đặng Văn G", yearsOfService: 2 },
  { id: "emp8", name: "Bùi Thị H", yearsOfService: 6 },
]

const resourcePositionsData: ResourcePosition[] = [
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

const invoiceSchedules: InvoiceSchedule[] = [
  {
    id: "sched1",
    sowId: "sow1",
    startDate: "2023-10-01",
    endDate: "2023-10-31",
    isBilled: false,
  },
  {
    id: "sched2",
    sowId: "sow1",
    startDate: "2023-11-01",
    endDate: "2023-11-30",
    isBilled: true,
  },
  {
    id: "sched3",
    sowId: "sow1",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    isBilled: false,
  },
  {
    id: "sched4",
    sowId: "sow2",
    startDate: "2024-01-01",
    endDate: "2023-01-30",
    isBilled: false,
  },
  {
    id: "sched5",
    sowId: "sow2",
    startDate: "2024-02-01",
    endDate: "2023-01-28",
    isBilled: false,
  },

  {
    id: "sched8",
    sowId: "sow4",
    startDate: "2023-10-01",
    endDate: "2023-10-31",
    isBilled: false,
  },
  {
    id: "sched9",
    sowId: "sow4",
    startDate: "2023-11-01",
    endDate: "2023-11-30",
    isBilled: false,
  },
  {
    id: "sched6",
    sowId: "sow5",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    isBilled: false,
  },
  {
    id: "sched7",
    sowId: "sow7",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    isBilled: false,
  },
]

const sowsData: SOW[] = [
  {
    id: "sow1",
    name: "Giai đoạn 1 - Phát triển core",
    type: "T&M",
    projectIds: ["proj1"],
    startDate: "2024-01-01",
    endDate: "2024-03-31",
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

const timesheetsData = sowsData.flatMap((sow) =>
  generateSOWTimesheets(sow, resourceAllocations),
)

export function isWithinInterval(
  date: Date,
  interval: { start: Date; end: Date },
): boolean {
  return date >= interval.start && date <= interval.end
}

interface MergedSOW extends SOW {
  originalSOWs: SOW[]
  mergedProjectId: string
}

function InvoiceCreationFlow() {
  const { control, watch, setValue } = useForm<{
    accountIds: string
    projectIds: string[]
    sowIds: string[]
  }>({
    defaultValues: {
      accountIds: "",
      projectIds: [],
      sowIds: [],
    },
  })

  const [invoiceDetails, setInvoiceDetails] = useState<
    Array<{
      sow: SOW | MergedSOW
      isMerged: boolean
      positions: ResourcePosition[]
      timesheets: Timesheet[]
    }>
  >([])

  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredSOWs, setFilteredSOWs] = useState<SOW[]>([])
  const [mergedSOWs, setMergedSOWs] = useState<MergedSOW[]>([])

  const selectedAccounts = useWatch({ control, name: "accountIds" })
  const selectedProjects = useWatch({ control, name: "projectIds" })
  const selectedSowIds = useWatch({ control, name: "sowIds" })

  useEffect(() => {
    if (!selectedAccounts) {
      setFilteredProjects([])
      setFilteredSOWs([])
      setInvoiceDetails([])

      if (watch("projectIds").length > 0) setValue("projectIds", [])
      if (watch("sowIds").length > 0) setValue("sowIds", [])

      return
    }

    const newProjects = projectsData[selectedAccounts] || []
    if (JSON.stringify(newProjects) !== JSON.stringify(filteredProjects)) {
      setFilteredProjects(newProjects)
    }
  }, [selectedAccounts, watch, setValue, filteredProjects])

  const mergeSelectedSOWs = () => {
    if (selectedProjects.length !== 1) {
      alert("Vui lòng chọn chính xác 1 project để merge SOW")
      return
    }

    const selectedSOWs = filteredSOWs.filter(
      (sow) =>
        selectedSowIds.includes(sow.id) &&
        !mergedSOWs.some((m) => m.originalSOWs.includes(sow)),
    )

    if (selectedSOWs.length < 2) return

    const mergedSOW: MergedSOW = {
      ...selectedSOWs[0],
      id: `merged-${Date.now()}`,
      name: `[Merged] ${selectedSOWs.map((s) => s.name).join(" + ")}`,
      startDate: getEarliestStartDate(selectedSOWs),
      endDate: getLatestEndDate(selectedSOWs),
      originalSOWs: selectedSOWs,
      mergedProjectId: selectedProjects[0],
      invoiceSchedules: mergeInvoiceSchedules(selectedSOWs),
      resourcePositions: mergeResourcePositions(selectedSOWs),
    }

    setMergedSOWs((prev) => [...prev, mergedSOW])
    setValue(
      "sowIds",
      selectedSowIds.filter((id) => !selectedSOWs.some((s) => s.id === id)),
    )
  }

  const mergeInvoiceSchedules = (sows: SOW[]) => {
    const allSchedules = sows.flatMap((sow) =>
      sow.invoiceSchedules.map((s) => ({
        ...s,
        originalSOWId: sow.id,
      })),
    )

    return [...new Map(allSchedules.map((s) => [s.id, s])).values()]
  }

  const mergeResourcePositions = (sows: SOW[]) => {
    return sows.flatMap((sow) =>
      sow.resourcePositions.map((pos) => ({
        ...pos,
        id: `${sow.id}-${pos.id}`,
      })),
    )
  }

  useEffect(() => {
    const newSOWs = sowsData.filter((sow) =>
      sow.projectIds?.some((pId) => selectedProjects.includes(pId)),
    )

    if (JSON.stringify(newSOWs) !== JSON.stringify(filteredSOWs)) {
      setFilteredSOWs([...new Set([...newSOWs])])
    }
  }, [selectedProjects, filteredSOWs])

  const allDisplaySOWs = [
    ...filteredSOWs.filter(
      (sow) => !mergedSOWs.some((m) => m.originalSOWs.includes(sow)),
    ),
    ...mergedSOWs,
  ]

  useEffect(() => {
    const validSowIds = selectedSowIds.filter((sowId) =>
      allDisplaySOWs.some((sow) => sow.id === sowId),
    )

    const details = validSowIds.map((sowId) => {
      const sow = allDisplaySOWs.find((s) => s.id === sowId)!
      const isMerged = mergedSOWs.some((m) => m.id === sowId)
      const mergedGroup = isMerged
        ? mergedSOWs.find((m) => m.id === sowId)!
        : null

      const positions: ResourcePosition[] = []
      let timesheets: Timesheet[] = []

      if (isMerged && mergedGroup) {
        timesheets = mergedGroup.originalSOWs.flatMap((s) =>
          timesheetsData.filter((t) =>
            resourceAllocations.some(
              (a) => a.sowId === s.id && a.id === t.allocationId,
            ),
          ),
        )
      } else {
        timesheets = timesheetsData.filter((t) =>
          resourceAllocations.some(
            (a) => a.sowId === sowId && a.id === t.allocationId,
          ),
        )
      }

      return {
        sow: mergedGroup || sow,
        isMerged,
        positions: [...new Map(positions.map((p) => [p.id, p]))].map(
          ([, p]) => p,
        ),
        timesheets,
      }
    })
    setInvoiceDetails(details)
  }, [selectedSowIds, mergedSOWs, allDisplaySOWs.find, allDisplaySOWs.some])

  const handleRemoveInvoice = (sowId: string) => {
    setValue(
      "sowIds",
      selectedSowIds.filter((id) => id !== sowId),
    )
  }

  return (
    <Box p={4} h={"fit-content"}>
      {selectedProjects.length === 1 && selectedSowIds.length >= 2 && (
        <Button colorScheme="teal" onClick={mergeSelectedSOWs} mb={4}>
          Merge SOWs
        </Button>
      )}
      <Flex gap={4} wrap={"wrap"} justifyContent={"flex-start"}>
        <Flex gap={4} flexDirection={"column"} justifyContent={"flex-start"}>
          <InputSelect
            control={control}
            options={accounts.items.map((acc: Account) => ({
              value: acc.id,
              label: acc.name,
            }))}
            label="Select Account"
            id="accountIds"
            isLoading={false}
            onInputChange={() => {}}
          />

          {selectedAccounts && (
            <InputSelect
              control={control}
              options={(filteredProjects || []).map((proj: Project) => ({
                value: proj.id,
                label: proj.name,
              }))}
              label="Select Project"
              id="projectIds"
              isMuti
              isLoading={false}
              onInputChange={() => {}}
            />
          )}

          {selectedProjects.length > 0 && (
            <InputSelect
              control={control}
              options={allDisplaySOWs.map((s: any) => ({
                value: s.id,
                label: s.originalSOWs
                  ? `[Merged] ${s.originalSOWs.map((so: any) => so.name).join(" + ")} (${s.type})`
                  : `${s.name} (${s.type})`,
              }))}
              label="Select contract (SOWS)"
              id="sowIds"
              isMuti
              isLoading={false}
            />
          )}
        </Flex>
        <VStack flex={"auto"} flexDirection={"row"} align="stretch">
          {invoiceDetails.map((detail) => (
            <InvoiceDetailCard
              key={detail.sow.id}
              detail={detail}
              onRemove={() => handleRemoveInvoice(detail.sow.id)}
            />
          ))}
        </VStack>
      </Flex>
    </Box>
  )
}

function InvoiceDetailCard({
  detail,
  onRemove,
}: {
  detail: {
    sow: SOW | MergedSOW
    isMerged: boolean
    positions: ResourcePosition[]
    timesheets: Timesheet[]
  }
  onRemove: () => void
}) {
  const [selectedSchedules, setSelectedSchedules] = useState<InvoiceSchedule[]>(
    [],
  )
  const [manualAmounts, setManualAmounts] = useState<Record<string, number>>(
    () => ({}),
  )
  // const { register, handleSubmit } = useForm()

  const handleCreateInvoice = () => {
    if (detail.sow.type === "T&M") {
      if (selectedSchedules.length === 0) {
        return
      }

      const updatedSchedules = detail.sow.invoiceSchedules.map((s) =>
        selectedSchedules.some((ss) => ss.id === s.id)
          ? { ...s, isBilled: true }
          : s,
      )

      detail.sow.invoiceSchedules = updatedSchedules
      setSelectedSchedules([])
    } else {
    }
  }

  const isAllocationInSchedule = (
    alloc: ResourceAllocation,
    schedule: InvoiceSchedule,
  ) => {
    const allocStart = new Date(alloc.startDate)
    const allocEnd = new Date(alloc.endDate)
    const scheduleStart = new Date(schedule.startDate)
    const scheduleEnd = new Date(schedule.endDate)

    return allocStart <= scheduleEnd && allocEnd >= scheduleStart
  }

  const getMonthsInSchedule = (schedule: InvoiceSchedule) => {
    const start = new Date(schedule.startDate)
    const end = new Date(schedule.endDate)
    return (
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      (end.getDate() >= start.getDate() ? 1 : 0)
    )
  }

  const getEmployeeHours = (
    employeeId: string,
    schedule: InvoiceSchedule,
    targetSOW?: SOW,
  ): number => {
    return detail.timesheets
      .filter((ts) => {
        const alloc = resourceAllocations.find(
          (a) => a.id === ts.allocationId && a.employeeId === employeeId,
        )

        const isInTargetSOW = targetSOW ? alloc?.sowId === targetSOW.id : true

        const isInSchedule =
          new Date(ts.date) >= new Date(schedule.startDate) &&
          new Date(ts.date) <= new Date(schedule.endDate)

        return alloc && isInTargetSOW && isInSchedule
      })
      .reduce((sum, ts) => sum + ts.hours, 0)
  }

  const calculateEmployeeInvoice = (
    employee: Employee,
    schedule: InvoiceSchedule,
    targetSOW?: SOW,
  ) => {
    const positions = targetSOW
      ? targetSOW.resourcePositions
      : (detail.sow as MergedSOW).originalSOWs.flatMap(
          (s) => s.resourcePositions,
        )

    const position = positions.find((p) =>
      resourceAllocations.some(
        (a) =>
          a.employeeId === employee.id &&
          a.positionId === p.id &&
          isAllocationInSchedule(a, schedule),
      ),
    )

    if (!position) return 0

    const hours = getEmployeeHours(employee.id, schedule, targetSOW)

    if (position.hourlyRate) {
      return hours * position.hourlyRate
    }

    if (position.monthlyRate) {
      const months = getMonthsInSchedule(schedule)
      const baseSalary = position.monthlyRate * months

      const publicHolidays = getPublicHolidaysInSchedule(schedule, {
        timesheets: detail.timesheets,
      })
      const allowedLeave = 1 * months + publicHolidays
      const actualWorkDays = hours / 8
      const excessLeave = Math.max(
        0,
        20 * months - actualWorkDays - allowedLeave,
      )

      return baseSalary - excessLeave * (position.monthlyRate / 20)
    }

    return 0
  }

  const toggleSchedule = (schedule: InvoiceSchedule) => {
    setSelectedSchedules((prev) =>
      prev.some((s) => s.id === schedule.id)
        ? prev.filter((s) => s.id !== schedule.id)
        : [...prev, schedule],
    )
  }

  const calculateScheduleTotal = (
    schedule: InvoiceSchedule,
    targetSOW?: SOW,
  ) => {
    return employees.reduce((total, employee) => {
      const position = (targetSOW || detail.sow).resourcePositions.find((p) =>
        resourceAllocations.some(
          (a) =>
            a.employeeId === employee.id &&
            a.positionId === p.id &&
            isAllocationInSchedule(a, schedule),
        ),
      )

      if (!position) return total

      if (position.hourlyRate) {
        const hours = getEmployeeHours(employee.id, schedule, targetSOW)
        return total + hours * position.hourlyRate
      }

      if (position.monthlyRate) {
        const months = getMonthsInSchedule(schedule)
        const dailyRate = position.monthlyRate / 20

        const publicHolidays = getPublicHolidaysInSchedule(schedule, {
          timesheets: detail.timesheets,
        })
        const allowedLeave = 1 * months + publicHolidays

        const totalHours = getEmployeeHours(employee.id, schedule, targetSOW)
        const actualWorkDays = totalHours / 8

        const standardWorkDays = 20 * months
        const totalLeaveDays = standardWorkDays - actualWorkDays
        const excessLeave = Math.max(0, totalLeaveDays - allowedLeave)

        const deduction = excessLeave * dailyRate

        return total + (position.monthlyRate * months - deduction)
      }

      return total
    }, 0)
  }

  const isMergedGroup = (sow: SOW | MergedSOW): sow is MergedSOW => {
    return "originalSOWs" in sow
  }

  const handleAmountChange = useCallback((sowId: string, value: number) => {
    setManualAmounts((prev) => {
      if (prev[sowId] === value) return prev
      return { ...prev, [sowId]: value }
    })
  }, [])

  const renderSOWContent = () => {
    if (isMergedGroup(detail.sow)) {
      return (
        <Box>
          <Text fontSize="lg" fontWeight="600" mb={4}>
            {detail.sow.name}
          </Text>

          <Flex w={"full"} flexDirection={"row"} wrap={"wrap"} gap={20}>
            {detail.sow.originalSOWs.map((sow) => (
              <Box key={sow.id} mb={6}>
                {sow.type === "T&M" ? (
                  <TMInvoiceSection
                    key={sow.id}
                    sow={sow}
                    selectedSchedules={selectedSchedules}
                    onToggleSchedule={toggleSchedule}
                    calculateScheduleTotal={calculateScheduleTotal}
                    isMerged={true}
                  />
                ) : (
                  <FixedPriceSection
                    sow={sow}
                    onAmountChange={handleAmountChange}
                    onToggleSchedule={toggleSchedule}
                    value={manualAmounts[sow.id]}
                  />
                )}
              </Box>
            ))}
          </Flex>
          <TotalSection
            selectedSchedules={selectedSchedules}
            manualAmounts={manualAmounts}
          />
        </Box>
      )
    }

    return (
      <Flex w="full" justify="center">
        {detail.sow.type === "T&M" ? (
          <TMInvoiceSection
            isMerged={false}
            sow={detail.sow}
            selectedSchedules={selectedSchedules}
            onToggleSchedule={toggleSchedule}
            calculateScheduleTotal={calculateScheduleTotal}
          />
        ) : (
          <FixedPriceSection
            sow={detail.sow}
            onAmountChange={handleAmountChange}
            onToggleSchedule={toggleSchedule}
            value={manualAmounts[detail.sow.id]}
          />
        )}
      </Flex>
    )
  }

  const ScheduleDetails = ({
    schedule,
    sow,
  }: {
    schedule: InvoiceSchedule
    sow: SOW
  }) => {
    return (
      <Box mb={4} p={3} borderWidth={1} borderRadius="md">
        <Flex justify="space-between" mb={3}>
          <Text fontWeight="600">
            {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
          </Text>
          <Text color="green.600">
            {formatCurrency(
              calculateScheduleTotal(schedule, sow),
              sow.currency_code as CurrencyCodeEnum,
            )}
          </Text>
        </Flex>

        {employees
          .filter((employee) =>
            resourceAllocations.some(
              (a) =>
                a.employeeId === employee.id &&
                a.sowId === sow.id &&
                isAllocationInSchedule(a, schedule),
            ),
          )
          .map((employee) => {
            const position = sow.resourcePositions.find((p) =>
              resourceAllocations.some(
                (a) => a.employeeId === employee.id && a.positionId === p.id,
              ),
            )

            const hours = getEmployeeHours(employee.id, schedule, sow)
            const amount = calculateEmployeeInvoice(employee, schedule, sow)

            return (
              <Flex key={employee.id} justify="space-between" mb={2}>
                <Box>
                  <Text>{employee.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {position?.name} • {hours}h
                  </Text>
                </Box>
                <Text color="green.500">
                  {formatCurrency(
                    amount,
                    sow.currency_code as CurrencyCodeEnum,
                  )}
                </Text>
              </Flex>
            )
          })}
      </Box>
    )
  }

  const TMInvoiceSection = ({
    sow,
    selectedSchedules,
    onToggleSchedule,
    calculateScheduleTotal,
    isMerged = false,
  }: {
    sow: SOW
    selectedSchedules: InvoiceSchedule[]
    onToggleSchedule: (schedule: InvoiceSchedule) => void
    calculateScheduleTotal: (
      schedule: InvoiceSchedule,
      targetSOW: SOW,
    ) => number
    isMerged?: boolean
  }) => {
    const availableSchedules = sow.invoiceSchedules.filter((s) => !s.isBilled)

    let totalAmount = 0

    if (detail.isMerged) {
      for (const sow of (detail.sow as MergedSOW).originalSOWs) {
        if (sow.type === "T&M") {
          for (const sched of selectedSchedules) {
            if (sched.sowId === sow.id) {
              totalAmount += calculateScheduleTotal(sched, sow)
            }
          }
        }
      }
    } else if (detail.sow.type === "T&M") {
      for (const sched of selectedSchedules) {
        totalAmount += calculateScheduleTotal(sched, detail.sow)
      }
    }

    const calculateEmployeeTotals = () => {
      const employeeMap = new Map<string, { hours: number; amount: number }>()
      const tmSchedules = selectedSchedules.filter((s) => {
        const sow = isMergedGroup(detail.sow)
          ? detail.sow.originalSOWs.find((so) => so.id === s.sowId)
          : detail.sow
        return sow?.type === "T&M"
      })

      for (const schedule of tmSchedules) {
        const targetSOW = isMergedGroup(detail.sow)
          ? detail.sow.originalSOWs.find((so) => so.id === schedule.sowId)
          : detail.sow

        if (!targetSOW) continue

        for (const employee of employees) {
          const hours = getEmployeeHours(employee.id, schedule, targetSOW)
          const amount = calculateEmployeeInvoice(employee, schedule, targetSOW)

          if (hours > 0) {
            const existing = employeeMap.get(employee.id) || {
              hours: 0,
              amount: 0,
            }
            employeeMap.set(employee.id, {
              hours: existing.hours + hours,
              amount: existing.amount + amount,
            })
          }
        }
      }

      return Array.from(employeeMap.entries()).map(([empId, totals]) => ({
        employee: employees.find((e) => e.id === empId)!,
        ...totals,
      }))
    }

    return (
      <Box>
        <Text fontWeight="500" mb={2}>
          {sow.name}
        </Text>

        <Flex wrap="wrap" gap={2} mb={4}>
          {availableSchedules.map((schedule) => (
            <Button
              key={schedule.id}
              variant={
                selectedSchedules.some((s) => s.id === schedule.id)
                  ? "solid"
                  : "outline"
              }
              onClick={() => onToggleSchedule(schedule)}
            >
              {`${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}`}
            </Button>
          ))}
        </Flex>

        {selectedSchedules
          .filter((s) => s.sowId === sow.id)
          .map((schedule) => (
            <ScheduleDetails key={schedule.id} schedule={schedule} sow={sow} />
          ))}

        {selectedSchedules.length > 1 && (
          <Box mb={4} p={3} borderWidth={1} borderRadius="md">
            <Text fontWeight={"600"}>Deatil Information</Text>
            {calculateEmployeeTotals().map(({ employee, hours, amount }) => (
              <Flex key={employee.id} justify="space-between" mb={2}>
                <Box>
                  <Text>{employee.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Total working hours: {hours}h
                  </Text>
                </Box>
                <Text color="green.500">
                  {formatCurrency(
                    amount,
                    detail.sow.currency_code as CurrencyCodeEnum,
                  )}
                </Text>
              </Flex>
            ))}
          </Box>
        )}
        {!isMerged && (
          <Box mt={4} borderTopWidth={1} pt={4}>
            <Flex justify="space-between" fontWeight="bold">
              <Text>Total:</Text>
              <Text>
                {formatCurrency(
                  totalAmount,
                  sow.currency_code as CurrencyCodeEnum,
                )}
              </Text>
            </Flex>
          </Box>
        )}
      </Box>
    )
  }

  const FixedPriceSection = React.memo(
    ({
      sow,
      onAmountChange,
      onToggleSchedule,
      value,
    }: {
      sow: SOW
      onAmountChange: (sowId: string, value: number) => void
      onToggleSchedule: (schedule: InvoiceSchedule) => void
      value?: number
    }) => {
      const [localValue, setLocalValue] = useState(value || "")
      const availableSchedules = sow.invoiceSchedules.filter((s) => !s.isBilled)

      useEffect(() => {
        const timeout = setTimeout(() => {
          onAmountChange(sow.id, Number(localValue))
        }, 1500)
        return () => clearTimeout(timeout)
      }, [localValue, onAmountChange, sow.id])

      return (
        <Box>
          <Text fontWeight="500" mb={2}>
            {sow.name} ({sow.type})
            {sow.type === "MAINTENANCE" && " - Nhập số tiền bảo trì"}
          </Text>
          <Flex wrap="wrap" gap={2} mb={4}>
            {availableSchedules.map((schedule) => (
              <Button
                key={schedule.id}
                variant={
                  selectedSchedules.some((s) => s.id === schedule.id)
                    ? "solid"
                    : "outline"
                }
                onClick={() => onToggleSchedule(schedule)}
              >
                {`${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}`}
              </Button>
            ))}
          </Flex>
          <Input
            type={"text"}
            placeholder="Nhập số tiền"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
          />
        </Box>
      )
    },
  )

  const TotalSection = ({
    selectedSchedules,
    manualAmounts,
  }: {
    selectedSchedules: InvoiceSchedule[]
    manualAmounts: Record<string, number>
  }) => {
    const calculateTotal = () => {
      let total = 0

      if (detail.isMerged) {
        const tmSOWs = (detail.sow as MergedSOW).originalSOWs.filter(
          (s) => s.type === "T&M",
        )
        total += tmSOWs.reduce((sum, sow) => {
          const schedules = selectedSchedules.filter((s) => s.sowId === sow.id)
          return (
            sum +
            schedules.reduce(
              (schedSum, sched) =>
                schedSum + calculateScheduleTotal(sched, sow),
              0,
            )
          )
        }, 0)
      } else if (detail.sow.type === "T&M") {
        total += selectedSchedules.reduce(
          (sum, sched) => sum + calculateScheduleTotal(sched, detail.sow),
          0,
        )
      }
      total += Object.values(manualAmounts).reduce((a, b) => a + b, 0)
      return total
    }

    return (
      <Box mt={6} borderTopWidth={1} pt={4}>
        <Flex justify="space-between" fontWeight="bold">
          <Text>Total Final:</Text>
          <Text>
            {formatCurrency(
              calculateTotal(),
              detail.sow.currency_code as CurrencyCodeEnum,
            )}
          </Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box
      borderWidth={1}
      p={4}
      borderRadius="md"
      position="relative"
      h={"fit-content"}
    >
      <CloseButton
        position="absolute"
        right={2}
        top={2}
        onClick={onRemove}
        aria-label="Remove invoice"
      />

      {renderSOWContent()}

      <Button mt={4} onClick={handleCreateInvoice}>
        Confirm
      </Button>
    </Box>
  )
}

function InvoiceIndexCaculate() {
  return (
    <Dialog.Root size="cover">
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Tạo Invoice mới
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content h={"fit-content"}>
            <Dialog.Header>
              <Flex justify={"space-between"}>
                <Dialog.Title>Caculate Invoice</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton />
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>
            <Dialog.Body h={"fit-content"}>
              <InvoiceCreationFlow />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default InvoiceIndexCaculate
