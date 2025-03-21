import SegmentToggle from "@/components/common/SegmentToggle"
import InputSelect from "@/components/common/inputs/InputSelect"
import { useColorModeValue } from "@/components/ui/color-mode"
import { OPTIONCACULATE, OPTIONVIEWMODETIME } from "@/constants/invoice"
import type { CurrencyCodeEnum } from "@/types/common"
import { formatDate } from "@/utils"
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  Input,
  Portal,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { type UseFormSetValue, useForm, useWatch } from "react-hook-form"
import {
  accounts,
  employees,
  projectsData,
  resourceAllocations,
  resourcePositionsData,
  sowsData,
  timesheetsData,
} from "./data"
import {
  deepEqual,
  formatCurrency,
  getEarliestStartDate,
  getLatestEndDate,
  getPublicHolidays,
  getPublicHolidaysInSchedule,
  processSOWs,
} from "./helper"
import type {
  Account,
  AdjustmentItem,
  Employee,
  InvoiceEmployee,
  InvoicePosition,
  InvoiceScheduleCaculate,
  Project,
  ResourceAllocation,
  ResourcePosition,
  SOW,
  SOWCaculate,
  Timesheet,
} from "./types"

interface MergedSOW extends SOW {
  originalSOWs: SOWCaculate[]
  projectIds: string[]
}
function InvoiceCreationFlow() {
  const { control, watch, setValue } = useForm<{
    accountIds: string
    projectIds: string
    sowIds: string[]
  }>({
    defaultValues: {
      accountIds: "",
      projectIds: "",
      sowIds: [],
    },
  })

  const [invoiceDetails, setInvoiceDetails] = useState<
    Array<{
      sow: SOWCaculate | MergedSOW
      isMerged: boolean
      positions: ResourcePosition[]
      timesheets: Timesheet[]
    }>
  >([])

  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredSOWs, setFilteredSOWs] = useState<SOWCaculate[]>([])
  const [mergedSOWs, setMergedSOWs] = useState<MergedSOW[]>([])
  const prevProjectsRef = useRef<Project[]>(filteredProjects)
  const prevSOWsRef = useRef<SOW[]>(filteredSOWs)
  const prevInvoiceDetailsRef = useRef<typeof invoiceDetails>([])
  const [calculationMode, setCalculationMode] = useState<"NORMAL" | "FUTURE">(
    "NORMAL",
  )
  const [viewMode, setViewMode] = useState<"days" | "hours">("hours")
  const textColor = useColorModeValue("black", "white")
  const selectedAccounts = useWatch({ control, name: "accountIds" })
  const selectedProjects = useWatch({ control, name: "projectIds" })
  const selectedSowIds = useWatch({ control, name: "sowIds" })

  const formatWorkTime = (hours: number): string => {
    return viewMode === "hours"
      ? `${hours} h`
      : `${Number.parseFloat((hours / 8).toFixed(2))} days`
  }

  const { schedules, updatedSOWS } = processSOWs(
    filteredSOWs,
    calculationMode,
    { returnUpdatedSOWS: true },
  )

  useEffect(() => {
    if (!selectedAccounts) {
      setFilteredProjects([])
      setFilteredSOWs([])
      setInvoiceDetails([])

      if (watch("projectIds").length > 0) {
        setValue("projectIds", "", {
          shouldDirty: false,
          shouldValidate: false,
        })
      }
      if (watch("sowIds").length > 0) {
        setValue("sowIds", [], { shouldDirty: false, shouldValidate: false })
      }

      return
    }

    const newProjects = projectsData[selectedAccounts] || []
    if (
      newProjects.length !== prevProjectsRef.current.length ||
      !newProjects.every(
        (proj, i) => proj.id === prevProjectsRef.current[i]?.id,
      )
    ) {
      prevProjectsRef.current = newProjects
      setFilteredProjects(newProjects)
    }
  }, [selectedAccounts, setValue, watch])

  const mergeSelectedSOWs = () => {
    const selectedProject = watch("projectIds")

    if (!selectedProject) {
      alert("Vui lòng chọn chính xác 1 project để merge SOW")
      return
    }

    const selectedSOWs = allDisplaySOWs.filter(
      (sow) =>
        selectedSowIds.includes(sow.id) &&
        sow.projectIds?.includes(selectedProject),
    )

    if (selectedSOWs.length < 2) {
      alert("Vui lòng chọn ít nhất 2 SOW cùng project")
      return
    }

    const originalSOWs = selectedSOWs.filter(
      (sow): sow is SOWCaculate => !("originalSOWs" in sow),
    )

    const mergedSOW: MergedSOW = {
      ...originalSOWs[0],
      id: `merged-${Date.now()}`,
      name: `[Merged] ${originalSOWs.map((s) => s.name).join(" + ")}`,
      startDate: getEarliestStartDate(originalSOWs),
      endDate: getLatestEndDate(originalSOWs),
      originalSOWs: originalSOWs,
      projectIds: [selectedProjects[0]],
      invoiceSchedules: mergeInvoiceSchedules(originalSOWs),
      resourcePositions: mergeResourcePositions(originalSOWs),
    }

    setMergedSOWs((prev) => [...prev, mergedSOW])
    setValue("sowIds", [])
  }

  const mergeInvoiceSchedules = (
    sows: SOWCaculate[],
  ): InvoiceScheduleCaculate[] => {
    return sows.flatMap((sow) =>
      sow.invoiceSchedules.map((s) => ({
        ...s,
        startDate: s.startDate || "",
        endDate: s.endDate || "",
        sowId: s.sowId,
        isBilled: s.isBilled,
      })),
    )
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
    const selectedProject = selectedProjects

    if (!selectedProject) {
      setFilteredSOWs([])
      return
    }

    const originalSOWs = sowsData.filter((sow) =>
      sow.projectIds?.includes(selectedProject),
    )

    const { updatedSOWS } = processSOWs(originalSOWs, calculationMode, {
      returnUpdatedSOWS: true,
    })

    const newSOWs = [
      ...(updatedSOWS || []).filter((sow) =>
        sow.projectIds?.includes(selectedProject),
      ),
      ...mergedSOWs.filter((m) => m.projectIds.includes(selectedProject)),
    ] as (SOWCaculate | MergedSOW)[]

    if (JSON.stringify(newSOWs) !== JSON.stringify(prevSOWsRef.current)) {
      prevSOWsRef.current = newSOWs as SOWCaculate[]
      setFilteredSOWs(newSOWs as SOWCaculate[])
    }
  }, [selectedProjects, calculationMode, mergedSOWs])

  const allDisplaySOWs = useMemo(() => {
    const mergedSOWIds = new Set(mergedSOWs.map((m) => m.id))
    return [
      ...filteredSOWs.filter((sow) => !mergedSOWIds.has(sow.id)),
      ...mergedSOWs,
    ]
  }, [filteredSOWs, mergedSOWs])

  useEffect(() => {
    const validSowIds = selectedSowIds.filter((sowId) =>
      allDisplaySOWs.some((sow) => sow.id === sowId),
    )

    const details = validSowIds.map((sowId) => {
      const sow = allDisplaySOWs.find((s) => s.id === sowId)! as
        | SOWCaculate
        | MergedSOW
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

      if (
        (calculationMode === "NORMAL" || calculationMode === "FUTURE") &&
        (sow.type === "FIXED PRICE" || sow.type === "MAINTENANCE")
      ) {
        timesheets = []
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

    if (
      JSON.stringify(details) !== JSON.stringify(prevInvoiceDetailsRef.current)
    ) {
      prevInvoiceDetailsRef.current = details
      setInvoiceDetails(details)
    }
  }, [selectedSowIds, mergedSOWs, allDisplaySOWs, calculationMode])

  const handleRemoveInvoice = (sowId: string) => {
    setValue(
      "sowIds",
      selectedSowIds.filter((id) => id !== sowId),
    )
  }

  return (
    <Box p={4} h={"fit-content"}>
      <Flex mb={4} justifyContent={"flex-start"} gap={7}>
        {selectedSowIds.length >= 2 && (
          <Flex direction={"column"} gap={1}>
            <Text fontSize="sm" fontWeight="bold" color={textColor}>
              Mode Merge
            </Text>
            <Button bg={"teal.600"} onClick={mergeSelectedSOWs} mb={4}>
              Merge SOWs
            </Button>
          </Flex>
        )}
        <SegmentToggle
          value={viewMode}
          onChange={(val: "days" | "hours") => setViewMode(val)}
          options={OPTIONVIEWMODETIME}
          size={"lg"}
          label="View Mode Time"
        />
        <SegmentToggle
          value={calculationMode}
          onChange={(val: "NORMAL" | "FUTURE") => setCalculationMode(val)}
          options={OPTIONCACULATE}
          size={"lg"}
          label="Calculation Mode"
        />
      </Flex>
      <Flex gap={4} wrap={"wrap"} justifyContent={"flex-start"}>
        <Flex
          gap={4}
          flexDirection={"column"}
          w={"fit-content"}
          h={"fit-content"}
          justifyContent={"flex-start"}
          mb={4}
          p={3}
          borderWidth={1}
          borderRadius="md"
        >
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
              viewMode={viewMode}
              formatWorkTime={formatWorkTime}
              calculationMode={calculationMode}
              projectIds={selectedProjects}
              accountIds={selectedAccounts}
              periodsScheduleCaculation={schedules}
              sows={updatedSOWS || []}
            />
          ))}
        </VStack>
      </Flex>
    </Box>
  )
}

interface InformationTranfer {
  employees: any[]
  position: any[]
  total: number
}

function InvoiceDetailCard({
  detail,
  onRemove,
  viewMode,
  formatWorkTime,
  calculationMode,
  accountIds,
  projectIds,
  periodsScheduleCaculation,
  sows,
}: {
  detail: {
    sow: SOWCaculate | MergedSOW
    isMerged: boolean
    positions: ResourcePosition[]
    timesheets: Timesheet[]
  }
  onRemove: () => void
  viewMode: string
  formatWorkTime: (v: number) => string
  calculationMode: "NORMAL" | "FUTURE"
  accountIds: string
  projectIds: string
  periodsScheduleCaculation: InvoiceScheduleCaculate[]
  sows: SOWCaculate[]
}) {
  const [selectedSchedules, setSelectedSchedules] = useState<
    InvoiceScheduleCaculate[]
  >([])
  const [manualAmounts, setManualAmounts] = useState<Record<string, number>>(
    () => ({}),
  )
  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.700")
  const [isDueDateDialogOpen, setIsDueDateDialogOpen] = useState(false)
  const [dueDate, setDueDate] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { setValue, watch } = useForm<InformationTranfer>({ mode: "onChange" })
  const prevValues = useRef<{ total: number; employees: AdjustmentItem[] }>({
    total: 0,
    employees: [],
  })

  const isAllocationInSchedule = (
    alloc: ResourceAllocation,
    schedule: InvoiceScheduleCaculate,
  ) => {
    const allocStart = new Date(alloc.startDate)
    const allocEnd = new Date(alloc.endDate)
    const scheduleStart = new Date(schedule.startDate)
    const scheduleEnd = new Date(schedule.endDate)

    return allocStart <= scheduleEnd && allocEnd >= scheduleStart
  }

  const getMonthsInSchedule = (schedule: InvoiceScheduleCaculate) => {
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
    schedule: InvoiceScheduleCaculate,
    targetSOW?: SOW,
  ): number => {
    return detail.timesheets
      .filter((ts) => {
        const alloc = resourceAllocations.find(
          (a) => a.id === ts.allocationId && a.employeeId === employeeId,
        )

        const sow = sows.find((s) => s.id === alloc?.sowId)
        const isTMContract = sow?.type === "T&M"

        const isInTargetSOW = targetSOW ? alloc?.sowId === targetSOW.id : true
        const isInSchedule =
          new Date(ts.date) >= new Date(schedule.startDate) &&
          new Date(ts.date) <= new Date(schedule.endDate)

        return alloc && isInTargetSOW && isInSchedule && isTMContract
      })
      .reduce((sum, ts) => sum + ts.hours, 0)
  }

  const getActualHours = (
    schedule: InvoiceScheduleCaculate,
    employeeId: string,
  ): number => {
    return timesheetsData
      .filter((ts) => {
        const allocation = resourceAllocations.find(
          (a) => a.id === ts.allocationId,
        )

        const sow = allocation
          ? sows.find((s) => s.id === allocation.sowId)
          : null
        const isTMContract = sow?.type === "T&M"

        return (
          allocation?.employeeId === employeeId &&
          new Date(ts.date) >= new Date(schedule.startDate) &&
          new Date(ts.date) <= new Date(schedule.endDate) &&
          !ts.isHoliday &&
          isTMContract
        )
      })
      .reduce((sum, ts) => sum + ts.hours, 0)
  }

  const FormButtonSchedule = ({
    schedule,
    onToggleSchedule,
  }: {
    schedule: InvoiceScheduleCaculate
    onToggleSchedule: (schedule: InvoiceScheduleCaculate) => void
  }) => {
    return (
      <Button
        key={schedule.id}
        variant={
          selectedSchedules.some((s) => s.id === schedule.id)
            ? "solid"
            : "outline"
        }
        onClick={() => onToggleSchedule(schedule as InvoiceScheduleCaculate)}
        bg={
          selectedSchedules.some((s) => s.id === schedule.id) ? buttonColor : ""
        }
        borderRadius="full"
      >
        {`${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}`}
      </Button>
    )
  }

  const getPreviousSchedule = (
    currentSchedules: InvoiceScheduleCaculate[],
    isMerged: boolean,
    originalSOWs?: SOWCaculate[],
  ): InvoiceScheduleCaculate | null => {
    if (currentSchedules.length === 0) return null

    const earliestStartDate = currentSchedules.reduce(
      (min, s) => (new Date(s.startDate) < min ? new Date(s.startDate) : min),
      new Date(currentSchedules[0].startDate),
    )

    if (isMerged && originalSOWs) {
      const originalSOWIds = originalSOWs
        .filter((s) => s.type === "T&M")
        .map((s) => s.id)

      const allSchedules = periodsScheduleCaculation.filter(
        (s) =>
          originalSOWIds.includes(s.sowId) &&
          new Date(s.endDate) < earliestStartDate,
      )

      return allSchedules[0] || null
    }

    const currentSOW = sowsData.find((s) => s.id === currentSchedules[0]?.sowId)
    if (!currentSOW || currentSOW.type !== "T&M") return null

    return (
      periodsScheduleCaculation.filter(
        (s) =>
          s.sowId === currentSchedules[0].sowId &&
          new Date(s.endDate) < earliestStartDate,
      )[0] || null
    )
  }

  const getWorkDays = (schedule: InvoiceScheduleCaculate): number => {
    const start = new Date(schedule.startDate)
    const end = new Date(schedule.endDate)
    let workDays = 0

    const publicHolidays = getPublicHolidays(schedule).map((h) =>
      new Date(h).toDateString(),
    )

    const current = new Date(start)
    while (current <= end) {
      const dayOfWeek = current.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isHoliday = publicHolidays.includes(current.toDateString())

      if (!isWeekend && !isHoliday) {
        workDays++
      }

      current.setDate(current.getDate() + 1)
    }

    return workDays
  }

  const getPlannedHours = (schedule: InvoiceScheduleCaculate): number => {
    const workDays = getWorkDays(schedule)
    const monthlyLeave = 1

    return Math.max(workDays - monthlyLeave, 0) * 8
  }

  const AdjustmentDetails = ({
    currentSchedules,
  }: {
    currentSchedules: InvoiceScheduleCaculate[]
  }) => {
    const tmSchedules = useMemo(() => {
      return currentSchedules.filter((schedule) => {
        if (detail.isMerged) {
          const mergedSOW = detail.sow as MergedSOW
          const originalSOW = mergedSOW.originalSOWs.find(
            (s) => s.id === schedule.sowId,
          )
          return originalSOW?.type === "T&M"
        }
        return detail.sow.type === "T&M"
      })
    }, [currentSchedules, detail.sow, detail.isMerged])

    const previousSchedule = useMemo(
      () =>
        getPreviousSchedule(
          tmSchedules,
          detail.isMerged,
          detail.isMerged ? (detail.sow as MergedSOW).originalSOWs : undefined,
        ),
      [tmSchedules, detail.isMerged, detail.sow],
    )

    const { totalAdjustment, adjustments } = useMemo(() => {
      if (!previousSchedule) return { totalAdjustment: 0, adjustments: [] }

      const results = resourceAllocations
        .filter((a) => a.sowId === previousSchedule.sowId)
        .map((allocation) => {
          const employee = employees.find((e) => e.id === allocation.employeeId)
          if (!employee) return null

          const position = resourcePositionsData.find(
            (p) => p.id === allocation.positionId,
          )
          const { plannedHours, actualHours, variance } = calculateVariance(
            previousSchedule,
            employee,
          )
          const rate =
            position?.hourlyRate || (position?.monthlyRate ?? 0) / 160
          const adjustment = variance * rate

          return {
            employee,
            position: position?.name || "Không xác định",
            plannedHours,
            actualHours,
            variance,
            adjustment,
            rate,
          }
        })
        .filter(Boolean) as AdjustmentItem[]
      return {
        totalAdjustment: results.reduce((sum, r) => sum + r.adjustment, 0),
        adjustments: results,
      }
    }, [previousSchedule])

    const totalCurrent = useMemo(
      () => tmSchedules.reduce((sum, s) => sum + calculateBaseTotal(s), 0),
      [tmSchedules],
    )

    useEffect(() => {
      const newTotal = totalCurrent - totalAdjustment

      if (prevValues.current.total !== newTotal) {
        prevValues.current.total = newTotal
      }

      if (!deepEqual(prevValues.current.employees, adjustments)) {
        prevValues.current.employees = adjustments
      }
    }, [totalCurrent, totalAdjustment, adjustments])

    return (
      <Box
        display={"flex"}
        gap={8}
        flexDirection={{ base: "column", md: "row" }}
        alignItems={"flex-start"}
      >
        {previousSchedule && (
          <Box flex={1} width="100%">
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <Heading size="xl" mb={6} color="blue.800">
                ADJUSTMENT FROM PREVIOUS CYCLE
              </Heading>

              <Text fontSize="medium" mb={6} fontWeight="500">
                {formatDate(previousSchedule.startDate)} -{" "}
                {formatDate(previousSchedule.endDate)}
              </Text>

              {adjustments.map(
                ({
                  employee,
                  position,
                  plannedHours,
                  actualHours,
                  variance,
                  adjustment,
                  rate,
                }) => (
                  <Box
                    key={employee.id}
                    mb={8}
                    p={6}
                    borderWidth={1}
                    borderRadius="md"
                    bg="gray.50"
                    minW="500px"
                  >
                    <Flex direction="column" gap={4}>
                      <Flex justify={"start"} gap={4} alignItems="center">
                        <Text fontSize="medium" fontWeight="600">
                          {employee.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ({position})
                        </Text>
                      </Flex>

                      <Flex
                        justify="space-between"
                        gap={4}
                        flexWrap={{ base: "wrap", md: "nowrap" }}
                      >
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.500">
                            Price Level
                          </Text>
                          <Text>{rate.toLocaleString()}€/h</Text>
                        </Box>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.500">
                            Plan
                          </Text>
                          <Text>{plannedHours}h</Text>
                        </Box>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.500">
                            Actual
                          </Text>
                          <Text>{actualHours}h</Text>
                        </Box>
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.500">
                            Difference
                          </Text>
                          <Text color={variance > 0 ? "green.500" : "red.500"}>
                            {variance > 0 ? "+" : ""}
                            {variance}h
                          </Text>
                        </Box>
                      </Flex>

                      <Flex justify="flex-end" mt={2}>
                        <Box textAlign="right">
                          <Text
                            fontSize="lg"
                            fontWeight="600"
                            color={adjustment > 0 ? "green.500" : "red.500"}
                          >
                            {adjustment > 0 ? "Refund" : "Surcharge"}:{" "}
                            {formatCurrency(
                              adjustment,
                              detail.sow.currency_code as CurrencyCodeEnum,
                            )}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            ({Math.abs(variance)}h × {rate.toLocaleString()}€/h)
                          </Text>
                        </Box>
                      </Flex>
                    </Flex>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        )}

        <Box flex={1} width="100%" minW="500px">
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="xl" mb={6} color="blue.800">
              PAYMENT SUMMARY
            </Heading>

            {tmSchedules.map((schedule) => (
              <Flex key={schedule.id} justify="space-between" mb={3} px={2}>
                <Text fontSize="medium">
                  {formatDate(schedule.startDate)} -{" "}
                  {formatDate(schedule.endDate)}
                </Text>
                <Text fontSize="medium" fontWeight="500">
                  {calculateBaseTotal(schedule).toLocaleString()}€
                </Text>
              </Flex>
            ))}

            <Box mt={6} pt={4} borderTopWidth={2}>
              <Flex justify="space-between" mb={3} alignItems="center">
                <Text fontSize={"medium"} fontWeight="bold">
                  Total original value:
                </Text>
                <Text fontSize="medium" fontWeight="bold">
                  {totalCurrent.toLocaleString()}€
                </Text>
              </Flex>

              {previousSchedule && (
                <Flex justify="space-between" mb={3} alignItems="center">
                  <Text fontSize="medium">Total adjustment:</Text>
                  <Text
                    fontSize="medium"
                    color={totalAdjustment > 0 ? "green.500" : "red.500"}
                  >
                    {totalAdjustment > 0 ? "-" : "+"}
                    {Math.abs(totalAdjustment).toLocaleString()}€
                  </Text>
                </Flex>
              )}

              <Flex
                justify="space-between"
                alignItems="center"
                mt={4}
                flexWrap={{ base: "wrap", md: "nowrap" }}
              >
                <Text
                  fontSize="medium"
                  fontWeight="bold"
                  whiteSpace="nowrap"
                  flexShrink={0}
                >
                  Final total payment:
                </Text>{" "}
                <Spacer />
                <Text
                  fontSize="medium"
                  fontWeight="bold"
                  color="blue.600"
                  whiteSpace="nowrap"
                  flexShrink={0}
                >
                  {formatCurrency(
                    totalCurrent - totalAdjustment,
                    detail.sow.currency_code as CurrencyCodeEnum,
                  )}
                </Text>
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  const calculateBaseTotal = (schedule: InvoiceScheduleCaculate): number => {
    return resourceAllocations
      .filter((a) => a.sowId === schedule.sowId)
      .reduce((sum, allocation) => {
        const position = resourcePositionsData.find(
          (p) => p.id === allocation.positionId,
        )
        if (!position) return sum
        return (
          sum +
          (position.monthlyRate
            ? (position.monthlyRate / 20 / 8) * getPlannedHours(schedule)
            : (position.hourlyRate || 0) * getPlannedHours(schedule))
        )
      }, 0)
  }

  const calculateVariance = (
    schedule: InvoiceScheduleCaculate,
    employee: Employee,
  ) => {
    const plannedHours = 20 * 8
    const publicHolidays = getPublicHolidays(schedule)
    const allowedLeaveHours = (1 + publicHolidays.length) * 8
    const actualHours = getActualHours(schedule, employee.id)

    return {
      plannedHours: plannedHours - allowedLeaveHours,
      actualHours,
      variance: plannedHours - allowedLeaveHours - actualHours,
    }
  }

  const calculateEmployeeInvoice = (
    employee: Employee,
    schedule: InvoiceScheduleCaculate,
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

  const toggleSchedule = (schedule: InvoiceScheduleCaculate) => {
    setSelectedSchedules((prev) =>
      prev.some((s) => s.id === schedule.id)
        ? prev.filter((s) => s.id !== schedule.id)
        : [...prev, schedule],
    )
  }

  const calculateScheduleTotal = (
    schedule: InvoiceScheduleCaculate,
    targetSOW: SOWCaculate | MergedSOW,
  ) => {
    const originalSOWs = isMergedGroup(targetSOW)
      ? targetSOW.originalSOWs
      : [targetSOW]

    return originalSOWs.reduce((total) => {
      return (
        total +
        employees.reduce((total, employee) => {
          const position = (targetSOW || detail.sow).resourcePositions.find(
            (p) =>
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

            const totalHours = getEmployeeHours(
              employee.id,
              schedule,
              targetSOW,
            )
            const actualWorkDays = totalHours / 8

            const standardWorkDays = 20 * months
            const totalLeaveDays = standardWorkDays - actualWorkDays
            const excessLeave = Math.max(0, totalLeaveDays - allowedLeave)

            const deduction = excessLeave * dailyRate

            return total + (position.monthlyRate * months - deduction)
          }

          return total
        }, 0)
      )
    }, 0)
  }

  const isMergedGroup = (sow: SOWCaculate | MergedSOW): sow is MergedSOW => {
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
                    setValueBackTo={setValue}
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
            calculationMode={calculationMode}
            totalAdjustment={prevValues.current.total}
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
            setValueBackTo={setValue}
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
    schedule: InvoiceScheduleCaculate
    sow: SOWCaculate
  }) => {
    return (
      <Box mb={4} p={3} borderWidth={1} borderRadius="md">
        {calculationMode !== "FUTURE" && (
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
        )}

        {calculationMode === "NORMAL" &&
          employees
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
                      {position?.name} • {formatWorkTime(hours)}
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
    setValueBackTo,
  }: {
    sow: SOWCaculate
    selectedSchedules: InvoiceScheduleCaculate[]
    onToggleSchedule: (schedule: InvoiceScheduleCaculate) => void
    calculateScheduleTotal: (
      schedule: InvoiceScheduleCaculate,
      targetSOW: SOWCaculate | MergedSOW,
    ) => number
    isMerged?: boolean
    setValueBackTo: UseFormSetValue<InformationTranfer>
  }) => {
    const availableSchedules = sow.invoiceSchedules.filter(
      (s) => !s.isBilled,
    ) as InvoiceScheduleCaculate[]

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
        totalAmount += calculateScheduleTotal(sched, detail.sow as SOWCaculate)
      }
    }

    const calculateEmployeeTotals = useCallback(() => {
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
    }, [selectedSchedules, detail.sow])

    const employeeTotals = useMemo(
      () => calculateEmployeeTotals(),
      [calculateEmployeeTotals],
    )

    useEffect(() => {
      if (totalAmount !== watch("total")) {
        setValueBackTo("total", totalAmount)
      }

      if (
        JSON.stringify(employeeTotals) !== JSON.stringify(watch("employees"))
      ) {
        setValueBackTo("employees", employeeTotals)
      }
    }, [totalAmount, employeeTotals, setValueBackTo])

    return (
      <Box>
        <Text fontWeight="500" mb={2}>
          {sow.name}
        </Text>

        <Flex wrap="wrap" gap={2} mb={4}>
          {availableSchedules.map((schedule) => (
            <FormButtonSchedule
              key={schedule.id}
              schedule={schedule}
              onToggleSchedule={onToggleSchedule}
            />
          ))}
        </Flex>

        {calculationMode !== "FUTURE" &&
          selectedSchedules
            .filter((s) => s.sowId === sow.id)
            .map((schedule) => (
              <ScheduleDetails
                key={schedule.id}
                schedule={schedule}
                sow={sow}
              />
            ))}

        {calculationMode === "FUTURE" && (
          <AdjustmentDetails currentSchedules={selectedSchedules} />
        )}

        {selectedSchedules.length > 1 && calculationMode !== "FUTURE" && (
          <Box mb={4} p={3} borderWidth={1} borderRadius="md">
            <Text fontWeight={"600"}>Detail Information</Text>
            {calculateEmployeeTotals().map(({ employee, hours, amount }) => (
              <Flex key={employee.id} justify="space-between" mb={2}>
                <Box>
                  <Text>{employee.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Total working {viewMode === "hours" ? "hours" : "days"}:{" "}
                    {formatWorkTime(hours)}
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
        {!isMerged && calculationMode !== "FUTURE" && (
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
      sow: SOWCaculate
      onAmountChange: (sowId: string, value: number) => void
      onToggleSchedule: (schedule: InvoiceScheduleCaculate) => void
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
              <FormButtonSchedule
                key={schedule.id}
                schedule={schedule}
                onToggleSchedule={onToggleSchedule}
              />
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
    calculationMode = "NORMAL",
    totalAdjustment = 0,
  }: {
    selectedSchedules: InvoiceScheduleCaculate[]
    manualAmounts: Record<string, number>
    calculationMode?: "NORMAL" | "FUTURE"
    totalAdjustment?: number
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

      if (calculationMode === "FUTURE") {
        total =
          totalAdjustment +
          Object.values(manualAmounts).reduce((a, b) => a + b, 0)
      }

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

  const handleConfirmCreateInvoice = async () => {
    if (!dueDate) {
      alert("Vui lòng chọn ngày due date")
      return
    }

    try {
      setIsCreating(true)
      await handleCreateInvoice(dueDate)
      setIsDueDateDialogOpen(false)
    } catch (error) {
      console.error("Lỗi khi tạo invoice:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const renderDueDateDialog = () => (
    <Dialog.Root
      open={isDueDateDialogOpen}
      onOpenChange={() => setIsDueDateDialogOpen(false)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Nhập ngày đến hạn</Dialog.Title>
              <Dialog.Description>
                Vui lòng chọn ngày due date cho invoice
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setIsDueDateDialogOpen(false)}
                mr={3}
              >
                Hủy
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleConfirmCreateInvoice}
                loading={isCreating}
              >
                Xác nhận tạo
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )

  const handleCreateInvoice = (dueDate: string) => {
    const accountName =
      accounts.items.find((a) => a.id === accountIds)?.name || "Chưa chọn KH"
    const projectName =
      Object.values(projectsData)
        .flat()
        .find((p) => p.id === projectIds)?.name || "Chưa chọn DA"
    const invoiceNo = ""

    const baseData = {
      invoice_name: `${accountName} - ${projectName} - ${invoiceNo}`,
      invoice_no: invoiceNo,
      sow_no: detail.sow.id,
      project_name:
        Object.values(projectsData)
          .flat()
          .find((p) => p.id === projectIds)?.name || "",
      account_name: accounts.items.find((a) => a.id === accountIds)?.name || "",
      status: "DRAFT" as const,
      issue_date: selectedSchedules[0]?.startDate || new Date().toISOString(),
      due_date: dueDate,
      payment_date: "",
    }

    const invoiceData: typeof baseData & {
      total: number
      employees?: InvoiceEmployee[] | AdjustmentItem[]
      positions?: InvoicePosition[]
    } = {
      ...baseData,
      total: 0,
    }

    switch (detail.sow.type) {
      case "T&M": {
        if (selectedSchedules.length === 0) {
          alert("Vui lòng chọn ít nhất một kỳ thanh toán")
          return
        }

        if (calculationMode === "NORMAL") {
          const employees = watch("employees")
          const total = watch("total")

          invoiceData.employees = employees
          invoiceData.total = total
        } else if (calculationMode === "FUTURE") {
          invoiceData.employees = prevValues.current.employees
          invoiceData.total = prevValues.current.total
        }
        break
      }

      case "FIXED PRICE": {
        const fixedAmount = manualAmounts[detail.sow.id]
        if (!fixedAmount || fixedAmount <= 0) {
          alert("Vui lòng nhập số tiền hợp lệ")
          return
        }

        invoiceData.positions = detail.sow.resourcePositions.map((p) => ({
          code_unit: detail.sow.currency_code,
          monthlyRate: p.monthlyRate || 0,
          position: p.name,
        }))

        invoiceData.total = fixedAmount
        break
      }

      case "MAINTENANCE": {
        const maintenanceFee = manualAmounts[detail.sow.id]
        if (!maintenanceFee || maintenanceFee <= 0) {
          alert("Vui lòng nhập phí bảo trì")
          return
        }

        invoiceData.total = maintenanceFee
        break
      }

      default: {
        alert("Loại hợp đồng không hợp lệ")
        return
      }
    }

    console.log("Invoice Data:", invoiceData)

    setManualAmounts({})
    setSelectedSchedules([])
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

      <Button
        size="sm"
        rounded={"lg"}
        bg={buttonColor}
        _hover={{ bg: buttonHoverColor }}
        color={buttontextColor}
        onClick={() => setIsDueDateDialogOpen(true)}
        mt={5}
      >
        Continue
      </Button>
      {renderDueDateDialog()}
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
