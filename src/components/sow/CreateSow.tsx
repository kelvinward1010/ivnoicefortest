import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isWeekend,
  parseISO,
  subDays,
} from "date-fns"
import { useEffect, useMemo, useRef, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import { FiEdit } from "react-icons/fi"
import { HiColorSwatch, HiUpload } from "react-icons/hi"
import { IoMdAdd } from "react-icons/io"
import { IoMdClose } from "react-icons/io"

import { ProjectSowsService, SowsInvoiceIssueSchedulesService } from "@/client"
import AlertModal from "@/components/common/AlertModal"
import Drive from "@/components/drives/docsManagement"
import { PreviewDocs } from "@/components/drives/previewDocs/PreviewDocs"
import AddResource from "@/components/sow/AddResource"
import InvoiceItem from "@/components/sow/InvoiceItem"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import {
  cssScrollBar,
  currencyOptions,
  invoiceBillingCycle,
  typeSowOptions,
} from "@/constants/sow"
import useCustomToast from "@/hooks/useCustomToast"
import { useGetFolderFiltered } from "@/services/drives"
import type { IDataReponse } from "@/types/drive"
import { formatDuration, getCurrentDateTimes } from "@/utils"
import {
  Box,
  EmptyState,
  FieldLabel,
  FieldRoot,
  Flex,
  Grid,
  GridItem,
  Icon,
  Image,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import { FaRegFile } from "react-icons/fa"

interface CreateSOWFormValues {
  start_date: string
  end_date: string
  next_invoice_date: string
  currency_code: string
  description: string
  onshore: boolean
  type: string
}

interface CreateSowProps {
  projectId: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function CreateSow({ isOpen, setIsOpen, projectId }: CreateSowProps) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useCustomToast()
  const editIconBg = useColorModeValue("black", "white")
  const createSowTitle = useColorModeValue("ui.dark", "ui.light")

  const contentRef = useRef<HTMLDivElement>(null)
  const [isChildOpen, setIsChildOpen] = useState<boolean>(false)
  const [totalManDay, setTotalManDay] = useState<number>(1)
  const [totalAmount, setTotalAmount] = useState<number>(1)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [nextInvoiceDate, setNextInvoiceDate] = useState<string>("")
  const [selectedBillingCycle, setSelectedBillingCycle] = useState(
    invoiceBillingCycle.items[0].value,
  )
  const [issueSchedule, setIssueSchedule] = useState<
    { label: string; value: string }[]
  >([])
  const [newInvoiceDate, setNewInvoiceDate] = useState<string | null>(null)
  const docsColor = useColorModeValue("blue.500", "blue.300")

  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.700")

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSOWFormValues>({
    defaultValues: {
      start_date: "",
      end_date: "",
      next_invoice_date: "",
      description: "",
      currency_code: currencyOptions.items[0].value,
      onshore: false,
      type: typeSowOptions.items[0].value,
    },
  })

  const { data, isLoading, refetch }: IDataReponse = useGetFolderFiltered({
    projectId: projectId,
  })
  const folderSOW = data.sow

  useEffect(() => {
    if (!isOpen) {
      reset({
        start_date: "",
        end_date: "",
        next_invoice_date: "",
        description: "",
        currency_code: currencyOptions.items[0].value,
        onshore: false,
        type: typeSowOptions.items[0].value,
      })
      setTotalAmount(1)
      setTotalManDay(1)
      setIssueSchedule([])
    }
  }, [isOpen, reset])

  const startDate = watch("start_date")
  const endDate = watch("end_date")
  const selectedType = watch("type")
  const formattedDuration = formatDuration(startDate, endDate)

  const filteredInvoiceBillingCycle = useMemo(() => {
    return createListCollection({
      items:
        selectedType === typeSowOptions.items[0].value
          ? [
              { value: "monthly", label: "Monthly" },
              { value: "custom", label: "Custom" },
            ]
          : [{ value: "custom", label: "Custom" }],
    })
  }, [selectedType])

  useEffect(() => {
    setSelectedBillingCycle(filteredInvoiceBillingCycle.items[0].value)
  }, [filteredInvoiceBillingCycle])

  useEffect(() => {
    if (!startDate || !endDate) return
    setIssueSchedule([])

    if (selectedBillingCycle === "custom") {
      let workingDay = endOfMonth(parseISO(startDate))
      if (isWeekend(workingDay)) {
        workingDay = subDays(workingDay, 1)
      }
      setIssueSchedule([
        {
          label: "Invoice of ",
          value: format(workingDay, "MM/dd/yyyy"),
        },
      ])
    } else {
      const schedule = eachMonthOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      }).map((date) => {
        let lastDay = endOfMonth(date)
        while (isWeekend(lastDay)) {
          lastDay = subDays(lastDay, 1)
        }
        return {
          label: "Invoice of ",
          value: format(lastDay, "MM/dd/yyyy"),
        }
      })

      if (schedule.length > 0) {
        schedule[schedule.length - 1].value = format(
          parseISO(endDate),
          "MM/dd/yyyy",
        )
      }
      setIssueSchedule([...schedule])
    }
  }, [startDate, endDate, selectedBillingCycle])

  useEffect(() => {
    if (issueSchedule.length === 0) {
      if (selectedBillingCycle === "custom" && startDate) {
        let workingDay = endOfMonth(parseISO(startDate))
        if (isWeekend(workingDay)) {
          workingDay = subDays(workingDay, 1)
        }
        const formattedDate = format(workingDay, "MM/dd/yyyy")
        setNextInvoiceDate(formattedDate)
        setValue("next_invoice_date", formattedDate)
        return
      }

      if (startDate) {
        let workingDay = endOfMonth(parseISO(startDate))
        if (isWeekend(workingDay)) {
          workingDay = subDays(workingDay, 1)
        }
        const formattedDate = format(workingDay, "MM/dd/yyyy")
        setNextInvoiceDate(formattedDate)
        setValue("next_invoice_date", formattedDate)
      }
    }
  }, [startDate, selectedBillingCycle, setValue, issueSchedule.length])

  useEffect(() => {
    if (issueSchedule.length > 0) {
      const newNextInvoiceDate = issueSchedule[0].value
      setNextInvoiceDate(newNextInvoiceDate)
      setValue("next_invoice_date", newNextInvoiceDate)
    }
  }, [issueSchedule, setValue])

  const handleBillingCycleChange = (details: { value: string[] }) => {
    setSelectedBillingCycle(details.value[0])
  }

  const handleConfirmAddInvoice = () => {
    if (newInvoiceDate) {
      const date = parseISO(newInvoiceDate)
      const formattedDate = format(date, "MM/dd/yyyy")

      setIssueSchedule([
        ...issueSchedule,
        {
          label: "Invoice of ",
          value: formattedDate,
        },
      ])
      setNewInvoiceDate(null)
    }
  }

  const handleEditInvoice = (index: number, newValue: string) => {
    let formattedValue = newValue
    if (newValue.includes("-")) {
      const date = parseISO(newValue)
      formattedValue = format(date, "MM/dd/yyyy")
    }
    const updatedSchedule = [...issueSchedule]
    updatedSchedule[index].value = formattedValue
    console.log(updatedSchedule[index].label)
    setIssueSchedule(updatedSchedule)
    if (index === 0) {
      setNextInvoiceDate(formattedValue)
      setValue("next_invoice_date", formattedValue)
    }
  }

  const handleDeleteInvoice = (index: number) => {
    const updatedSchedule = [...issueSchedule]
    updatedSchedule.splice(index, 1)
    setIssueSchedule(updatedSchedule)

    const newNextInvoiceDate =
      updatedSchedule.length > 0 ? updatedSchedule[0].value : ""
    setNextInvoiceDate(newNextInvoiceDate)
    setValue("next_invoice_date", newNextInvoiceDate)
  }

  const handleTotalValuesChange = ({
    totalManDay,
    totalAmount,
  }: {
    totalManDay: number
    totalAmount: number
  }) => {
    setTotalManDay(totalManDay)
    setTotalAmount(totalAmount)
  }

  const { mutateAsync: createSow, isPending } = useMutation({
    mutationFn: (data: CreateSOWFormValues) =>
      ProjectSowsService.createSow({
        projectId: projectId,
        requestBody: {
          ...data,
          total_manday: totalManDay,
          total_amount: totalAmount,
          next_invoice_date: nextInvoiceDate,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectSOW"] })
      showSuccess("SOW is successfully created")
      reset()
    },
    onError: () => {
      showError("SOW is created failed")
    },
  })

  const onSubmit: SubmitHandler<CreateSOWFormValues> = async (data) => {
    if (totalManDay <= 1 || totalAmount <= 1) {
      showError("Please add resource")
      return
    }
    const sowResponse = await createSow(data)
    const sowId = sowResponse?.id
    if (!sowId) showError("Create SOW failed")

    await Promise.all(
      issueSchedule.map((invoice) =>
        SowsInvoiceIssueSchedulesService.createInvoiceIssueSchedule({
          sowId,
          requestBody: {
            issue_date: format(new Date(invoice.value), "yyyy-MM-dd"),
          },
        }),
      ),
    )

    setIsOpen(false)
    setIssueSchedule([])
    setValue("next_invoice_date", "")
    setTotalAmount(1)
    setTotalManDay(1)
    reset()
  }

  return (
    <>
      <DialogRoot
        size={"full"}
        placement="center"
        motionPreset="scale"
        scrollBehavior="outside"
        aria-label="Create SOW"
        closeOnEscape={false}
        closeOnInteractOutside={false}
        open={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen.open)}
      >
        <DialogBackdrop />
        <DialogContent ref={contentRef}>
          <DialogHeader position="relative" mb={6}>
            <AlertModal
              onClick={() => {
                setIsOpen(false)
              }}
              triggerButton={
                <Flex
                  position="absolute"
                  right={{ base: 2, md: 5 }}
                  top={{ base: 2, md: 5 }}
                >
                  <IoMdClose size="24px" cursor="pointer" />
                </Flex>
              }
              title="Are you sure you want to leave?"
              bodyFirstLine="Your action is not completed"
              bodySecondLine="Data not saved will be lost"
              buttonContent="Agree"
            />
            <DialogTitle
              fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
              color={createSowTitle}
              display="flex"
              justifyContent="center"
              textTransform="uppercase"
              px={{ base: 2, md: 0 }}
            >
              Create new statement of work
            </DialogTitle>
          </DialogHeader>
          <DialogBody pt={0} pb={0}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ minHeight: "80vh" }}
            >
              <Grid
                templateColumns={{ base: "1fr", lg: "repeat(5, 1fr)" }}
                templateRows="auto"
                overflowY="auto"
                css={cssScrollBar}
                px={{ base: 1, md: 2 }}
                gap={{ base: 2, md: 4, lg: 6 }}
                maxH={"80vh"}
              >
                <GridItem colSpan={{ base: 1, lg: 1 }}>
                  <Grid gap={4}>
                    <Field>
                      <FieldLabel>Project Name</FieldLabel>
                      <Input
                        color="fg"
                        bgColor="bg.emphasized"
                        disabled
                        value="Contract Management"
                        variant="subtle"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Account Name</FieldLabel>
                      <Input
                        color="fg"
                        bgColor="bg.emphasized"
                        disabled
                        value="Harry Vu"
                        variant="subtle"
                      />
                    </Field>
                  </Grid>
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 1 }}>
                  <Grid gap={4}>
                    <Field label="Type of SOW">
                      <SelectRoot
                        collection={typeSowOptions}
                        defaultValue={[typeSowOptions.items[0].value]}
                        height="40px"
                        width="full"
                        {...register("type")}
                      >
                        <SelectTrigger>
                          <SelectValueText />
                        </SelectTrigger>
                        <SelectContent portalRef={contentRef}>
                          {typeSowOptions.items.map((type) => (
                            <SelectItem item={type} key={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </Field>
                    <Grid gap={4} templateColumns="repeat(1, 1fr)">
                      <Field label="Signed Parties">
                        <Checkbox {...register("onshore")}>On-Shore</Checkbox>
                      </Field>
                    </Grid>
                  </Grid>
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 1 }}>
                  <Grid gap={4}>
                    <Field label="Currency Unit">
                      <SelectRoot
                        collection={currencyOptions}
                        defaultValue={[currencyOptions.items[0].value]}
                        height="40px"
                        width="full"
                        {...register("currency_code")}
                      >
                        <SelectTrigger>
                          <SelectValueText>
                            {(
                              items: Array<{
                                label: string
                                flag: string
                              }>,
                            ) => {
                              const { label, flag } = items[0]
                              return (
                                <Flex
                                  gap={3}
                                  alignItems="center"
                                  justifyContent="flex-start"
                                >
                                  <Image boxSize="22px" w="36px" src={flag} />
                                  {label}
                                </Flex>
                              )
                            }}
                          </SelectValueText>
                        </SelectTrigger>
                        <SelectContent portalRef={contentRef}>
                          {currencyOptions.items.map((currency) => (
                            <SelectItem
                              item={currency}
                              key={currency.value}
                              gap={3}
                              justifyContent="flex-start"
                            >
                              <Image
                                boxSize="22px"
                                w="36px"
                                src={currency.flag}
                              />
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </Field>
                    <FieldRoot>
                      <FieldLabel>Descriptions</FieldLabel>
                      <Textarea
                        height={"40px"}
                        placeholder="Descriptions"
                        {...register("description")}
                      />
                    </FieldRoot>
                  </Grid>
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 1 }}>
                  <Grid gap={4}>
                    <Text fontWeight="medium">
                      Duration of SOW: {formattedDuration}
                    </Text>
                    <Flex
                      direction="column"
                      gap={{ base: "24px", md: "42px" }}
                      mt="-10px"
                    >
                      <Field
                        invalid={!!errors.start_date}
                        errorText={errors.start_date?.message}
                        w="full"
                      >
                        <Flex
                          w="full"
                          alignItems="center"
                          flexDirection={{ base: "column", sm: "row" }}
                        >
                          <FieldLabel
                            fontWeight="medium"
                            minW={{ base: "100%", sm: "50px" }}
                          >
                            From
                          </FieldLabel>
                          <Input
                            type="date"
                            width="full"
                            min={getCurrentDateTimes()}
                            {...register("start_date", {
                              required:
                                "Start date for duration time is required",
                            })}
                          />
                        </Flex>
                      </Field>
                    </Flex>
                  </Grid>
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 1 }}>
                  <Grid gap={4}>
                    <Field
                      invalid={!!errors.end_date}
                      errorText={errors.end_date?.message}
                      w="full"
                      mt={"26px"}
                    >
                      <Flex
                        w="full"
                        alignItems="center"
                        flexDirection={{ base: "column", sm: "row" }}
                      >
                        <FieldLabel
                          fontWeight="medium"
                          minW={{ base: "100%", sm: "50px" }}
                        >
                          To
                        </FieldLabel>
                        <Input
                          type="date"
                          width="full"
                          min={watch("start_date") || getCurrentDateTimes()}
                          {...register("end_date", {
                            required: "End date for duration time is required",
                            validate: (value) =>
                              !watch("start_date") ||
                              new Date(value) > new Date(watch("start_date")),
                          })}
                        />
                      </Flex>
                    </Field>
                    <Field>
                      <FieldLabel direction="row">Next Invoice Date</FieldLabel>
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        w="full"
                        gap={2}
                        flexDirection={{ base: "column", sm: "row" }}
                      >
                        <Input
                          placeholder="mm/dd/yyyy"
                          {...register("next_invoice_date")}
                          value={nextInvoiceDate}
                          readOnly={true}
                          disabled
                          color="fg"
                          variant="subtle"
                          bgColor="bg.emphasized"
                          width={{ base: "full", sm: "auto" }}
                          flex={{ sm: 1 }}
                        />
                        <DialogRoot
                          closeOnEscape={true}
                          closeOnInteractOutside={false}
                          scrollBehavior="inside"
                          placement="center"
                          motionPreset="scale"
                        >
                          <DialogTrigger asChild>
                            <Flex justifyContent="center" alignItems="center">
                              <Button
                                autoFocus={false}
                                h="38px"
                                w={{ base: "full", sm: "70px" }}
                                colorPalette="gray"
                                variant="subtle"
                              >
                                <FiEdit
                                  style={{
                                    marginRight: "3px",
                                    color: editIconBg,
                                    transition: "transform 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1.2)"
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)"
                                  }}
                                  cursor="pointer"
                                  onClick={() => setIsEditing(!isEditing)}
                                />
                              </Button>
                            </Flex>
                          </DialogTrigger>
                          <DialogContent
                            ref={contentRef}
                            width={{ base: "90%", md: "500px" }}
                          >
                            <DialogHeader>
                              <DialogTitle textAlign="center">
                                Invoice Issue Schedule Lists
                              </DialogTitle>
                            </DialogHeader>
                            <DialogBody
                              pt={0}
                              css={cssScrollBar}
                              maxH={{ base: "40vh", md: "50vh" }}
                            >
                              {nextInvoiceDate ? (
                                <Field label="Billing Cycle">
                                  <SelectRoot
                                    collection={filteredInvoiceBillingCycle}
                                    width="full"
                                    height="40px"
                                    mb={4}
                                    value={[selectedBillingCycle]}
                                    onValueChange={handleBillingCycleChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValueText />
                                    </SelectTrigger>
                                    <SelectContent portalRef={contentRef}>
                                      {filteredInvoiceBillingCycle.items.map(
                                        (billingCycle) => (
                                          <SelectItem
                                            item={billingCycle}
                                            key={billingCycle.value}
                                          >
                                            {billingCycle.label}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </SelectRoot>
                                </Field>
                              ) : null}
                              {issueSchedule.length > 0 ? (
                                <>
                                  <Box
                                    maxH={{ base: "20vh", md: "27vh" }}
                                    mb={4}
                                    position="relative"
                                    display="flex"
                                    flexDirection="column"
                                  >
                                    <Flex
                                      maxH={{ base: "30vh", md: "42vh" }}
                                      gap={4}
                                      direction="column"
                                      overflowY="auto"
                                      css={cssScrollBar}
                                    >
                                      {issueSchedule.map((issue, index) => (
                                        <InvoiceItem
                                          key={index}
                                          issue={issue}
                                          index={index}
                                          onDelete={handleDeleteInvoice}
                                          onEdit={handleEditInvoice}
                                        />
                                      ))}
                                      {newInvoiceDate !== null && (
                                        <Flex
                                          gap={2}
                                          alignItems="center"
                                          flexDirection={{
                                            base: "column",
                                            sm: "row",
                                          }}
                                        >
                                          <Input
                                            h="52px"
                                            type="date"
                                            min={startDate}
                                            value={newInvoiceDate}
                                            onChange={(e) =>
                                              setNewInvoiceDate(e.target.value)
                                            }
                                            width="full"
                                          />
                                          <Button
                                            h="52px"
                                            colorPalette="blue"
                                            onClick={handleConfirmAddInvoice}
                                            width={{ base: "full", sm: "auto" }}
                                          >
                                            <IoMdAdd />
                                          </Button>
                                          <Button
                                            h="52px"
                                            colorPalette="red"
                                            onClick={() =>
                                              setNewInvoiceDate(null)
                                            }
                                            width={{ base: "full", sm: "auto" }}
                                          >
                                            <IoMdClose />
                                          </Button>
                                        </Flex>
                                      )}
                                    </Flex>
                                  </Box>
                                  <Button
                                    colorPalette="blue"
                                    float="right"
                                    onClick={() =>
                                      setNewInvoiceDate(
                                        newInvoiceDate === null ? "" : null,
                                      )
                                    }
                                  >
                                    Add Invoice
                                  </Button>
                                </>
                              ) : (
                                <EmptyState.Root>
                                  <EmptyState.Content>
                                    <EmptyState.Indicator>
                                      <HiColorSwatch />
                                    </EmptyState.Indicator>
                                    <Flex direction="column" textAlign="center">
                                      <EmptyState.Title>
                                        No results found
                                      </EmptyState.Title>
                                    </Flex>
                                    <Button
                                      colorPalette="blue"
                                      mt={4}
                                      onClick={() => setNewInvoiceDate("")}
                                    >
                                      <IoMdAdd /> Add Invoice
                                    </Button>
                                  </EmptyState.Content>
                                </EmptyState.Root>
                              )}
                            </DialogBody>
                            <DialogCloseTrigger />
                          </DialogContent>
                        </DialogRoot>
                      </Flex>
                    </Field>
                  </Grid>
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 5 }} mt={{ base: 4, lg: 8 }}>
                  <AddResource onTotalValuesChange={handleTotalValuesChange} />
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 5 }} mt={{ base: 4, lg: 8 }}>
                  <Drive
                    componentToUpload={
                      <Button
                        variant="outline"
                        size="md"
                        as="label"
                        bg={buttonColor}
                        color={buttontextColor}
                        _hover={{ bg: buttonHoverColor }}
                        onClick={() => setIsChildOpen(!isChildOpen)}
                      >
                        <HiUpload /> Upload file
                      </Button>
                    }
                    folder_id={folderSOW?.id}
                    name_folder={"SOW"}
                    onClose={() => setIsChildOpen(!isChildOpen)}
                    isOpen={isChildOpen}
                    projectId={projectId}
                    handleUploadSuccess={() => refetch()}
                  />
                  {isLoading ? (
                    <>
                      <Spinner size="md" />
                      <Text mt={2}>Loading...</Text>
                    </>
                  ) : (
                    <VStack align="stretch" mt={4}>
                      {folderSOW?.files?.map((file, index) => (
                        <PreviewDocs
                          key={file.id}
                          fieldID={file.id}
                          name_docs={file.name}
                          componentToPreview={
                            <Box
                              key={index}
                              display="flex"
                              alignItems="center"
                              bg="gray.800"
                              p={3}
                              borderRadius="md"
                              width="full"
                              cursor={"pointer"}
                              _hover={{
                                bg: "gray.700",
                                color: "blue.500",
                                textDecoration: "underline",
                              }}
                            >
                              <Icon as={FaRegFile} mr={3} color={docsColor} />
                              <Text color={docsColor}>{file.name}</Text>
                            </Box>
                          }
                        />
                      ))}
                    </VStack>
                  )}
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 5 }} mt={{ base: 1, lg: 2 }}>
                  <DialogFooter
                    p={0}
                    justifyContent={{ base: "center", md: "flex-end" }}
                  >
                    <Button
                      type="submit"
                      colorPalette="blue"
                      loading={isPending}
                      width={{ base: "full", md: "auto" }}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </GridItem>
              </Grid>
            </form>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default CreateSow
