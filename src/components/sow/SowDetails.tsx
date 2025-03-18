import {
  type InvoiceIssueSchedulesPublic,
  ProjectSowsService,
  ProjectsService,
  SowsInvoiceIssueSchedulesService,
} from "@/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ClipboardIconButton,
  ClipboardLabel,
  ClipboardRoot,
} from "@/components/ui/clipboard"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InputGroup } from "@/components/ui/input-group"
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cssScrollBar, currencyOptions, typeSowOptions } from "@/constants/sow"
import useCustomToast from "@/hooks/useCustomToast"
import { getCurrentDateTimes } from "@/utils"
import {
  Box,
  DialogRoot,
  DialogTrigger,
  Flex,
  HStack,
  Image,
  Input,
  Textarea,
} from "@chakra-ui/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { format, formatISO, parse } from "date-fns"
import { useEffect, useRef, useState } from "react"
import { FiEdit } from "react-icons/fi"
import {
  MdOutlineCancel,
  MdOutlineCheckCircle,
  MdOutlineDelete,
} from "react-icons/md"

const SowDetails = ({
  projectId,
  sowId,
}: {
  projectId: string
  sowId: string
}) => {
  const { showSuccess, showError } = useCustomToast()

  const sowDetailsBgColor = useColorModeValue("ui.light", "ui.darkslate")
  const descriptionTextColor = useColorModeValue("#ABABAC", "#7D8189")
  const inputDateAndSelectBgColor = useColorModeValue("#F4F4F5", "#18181B")

  const contentRef = useRef<HTMLDivElement>(null)
  const [sowToDelete, setSowToDelete] = useState<string>("")
  const [isEditingSow, setIsEditingSow] = useState<boolean>(false)

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      return await ProjectsService.getProjectById({ projectId })
    },
  })

  const { data: invoiceIssueScheduleLists } =
    useQuery<InvoiceIssueSchedulesPublic>({
      queryKey: ["invoiceIssueList", sowId],
      queryFn: async () => {
        const response =
          await SowsInvoiceIssueSchedulesService.getAllInvoiceIssueSchedules({
            sowId,
          })
        return {
          data: response.data.map((invoice) => ({
            ...invoice,
            issue_date: invoice.issue_date
              ? format(new Date(invoice.issue_date), "MM/dd/yyyy")
              : "",
          })),
          count: response.count,
        }
      },
    })

  const { data: sowDetail, isFetching: isFetchingSowDetail } = useQuery({
    queryKey: ["sowDetail", sowId],
    queryFn: async () => {
      const response = await ProjectSowsService.getSow({ projectId, sowId })
      return {
        ...response,
        start_date: response.start_date
          ? format(new Date(response.start_date), "MM/dd/yyyy")
          : "",
        end_date: response.end_date
          ? format(new Date(response.end_date), "MM/dd/yyyy")
          : "",
        next_invoice_date: response.next_invoice_date
          ? format(new Date(response.next_invoice_date), "MM/dd/yyyy")
          : "",
      }
    },
  })

  const { mutateAsync: deleteSow, isPending: isDeletingSow } = useMutation({
    mutationFn: async ({
      projectId,
      sowId,
    }: {
      projectId: string
      sowId: string
    }) => {
      return await ProjectSowsService.deleteSow({ projectId, sowId })
    },
    onSuccess: () => {
      showSuccess("SOW is deleted successfully")
    },
    onError: () => {
      showError("SOW is deleted unsuccessfully")
    },
  })

  const formatISOWithUTC = (dateString: string) => {
    const date = parse(dateString, "MM/dd/yyyy", new Date())
    return formatISO(date, { representation: "date" })
  }

  const [editedSowData, setEditedSowData] = useState({
    currency_code: "",
    type: "",
    total_manday: "",
    total_amount: "",
    start_date: "",
    end_date: "",
    next_invoice_date: "",
    onshore: true,
    sow_document_id: "",
    description: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setEditedSowData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const { mutateAsync: updateSow } = useMutation({
    mutationFn: async ({
      projectId,
      sowId,
      requestBody,
    }: {
      projectId: string
      sowId: string
      requestBody: any
    }) => {
      return await ProjectSowsService.updateSow({
        projectId,
        sowId,
        requestBody,
      })
    },
    onSuccess: () => {
      showSuccess("SOW is updated successfully")
      setIsEditingSow(false)
    },
    onError: () => {
      showError("SOW is updated unsuccessfully")
    },
  })

  const handleToggleEditingSow = () => {
    setIsEditingSow(!isEditingSow)
  }

  const handleSaveEditedDataSow = async () => {
    const formattedData = {
      ...editedSowData,
      start_date: editedSowData.start_date
        ? formatISOWithUTC(editedSowData.start_date)
        : null,
      end_date: editedSowData.end_date
        ? formatISOWithUTC(editedSowData.end_date)
        : null,
      next_invoice_date: editedSowData.next_invoice_date
        ? formatISOWithUTC(editedSowData.next_invoice_date)
        : null,
    }
    await updateSow({ projectId, sowId, requestBody: formattedData })
  }

  useEffect(() => {
    if (sowDetail) {
      setEditedSowData({
        currency_code: sowDetail.currency_code || "",
        type: sowDetail.type || "",
        total_manday: sowDetail.total_manday?.toString() || "",
        total_amount: sowDetail.total_amount?.toString() || "",
        start_date: sowDetail.start_date
          ? format(new Date(sowDetail.start_date), "MM/dd/yyyy")
          : "",
        end_date: sowDetail.end_date
          ? format(new Date(sowDetail.end_date), "MM/dd/yyyy")
          : "",
        next_invoice_date: sowDetail.next_invoice_date
          ? format(new Date(sowDetail.next_invoice_date), "MM/dd/yyyy")
          : "",
        onshore: sowDetail.onshore ?? true,
        sow_document_id: sowDetail.sow_document_id || "",
        description: sowDetail.description || "",
      })
    }
  }, [sowDetail])

  const handleDeleteSow = async () => {
    setSowToDelete(sowId)
  }

  const confirmToDelete = async () => {
    try {
      if (sowToDelete) {
        await deleteSow({ projectId, sowId: sowToDelete })
        setSowToDelete("")
      }
    } catch {
      showError("SOW is deleted unsuccessfully")
    }
  }

  if (isLoadingProject || isFetchingSowDetail) {
    return (
      <Flex
        maxH={"90vh"}
        w={"full"}
        gap={2}
        rounded={"md"}
        border={"none"}
        display={"flex"}
        flexDirection={"column"}
        shadow={"md"}
        bgColor={sowDetailsBgColor}
      >
        <Box
          display={"flex"}
          gap={2}
          mt={4}
          pr={4}
          pb={0}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          <Skeleton height={"32px"} width={"38px"} />
          <Skeleton height={"32px"} width={"38px"} />
        </Box>
        <Box display={"flex"} gap={6} pb={0} p={4}>
          <Flex w={"50%"} direction={"column"} gap={6}>
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </Flex>
          <Flex w={"50%"} direction={"column"} gap={6}>
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </Flex>
        </Box>
        <Box p={4}>
          <Skeleton height="40px" />
        </Box>
        <Box pt={0} flex="1" display="flex" flexDirection="column" p={4}>
          <Skeleton height="125px" />
        </Box>
      </Flex>
    )
  }

  return (
    <Flex
      maxH={"90vh"}
      w={"full"}
      gap={2}
      rounded={"md"}
      border={"none"}
      display={"flex"}
      flexDirection={"column"}
      shadow={"md"}
      bgColor={sowDetailsBgColor}
    >
      <Box display={"flex"} gap={6} p={4} pb={0}>
        <Flex w={"50%"} direction={"column"} gap={6}>
          <ClipboardRoot w="100%" value={project?.name}>
            <ClipboardLabel>Project Name</ClipboardLabel>
            <InputGroup
              width="full"
              endElement={<ClipboardIconButton me="-2" />}
            >
              <Input
                disabled
                variant="subtle"
                value={project?.name}
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              />
            </InputGroup>
          </ClipboardRoot>
          <ClipboardRoot w={"100%"} value={sowDetail?.currency_code}>
            <ClipboardLabel>Currency Unit</ClipboardLabel>
            {!isEditingSow ? (
              <InputGroup
                width="full"
                endElement={<ClipboardIconButton me="-2" />}
              >
                <Input
                  disabled={!isEditingSow}
                  variant={"subtle"}
                  value={editedSowData.currency_code}
                  onChange={(e) =>
                    handleInputChange("currency_code", e.target.value)
                  }
                />
              </InputGroup>
            ) : (
              <SelectRoot
                variant={"subtle"}
                collection={currencyOptions}
                defaultValue={[sowDetail?.currency_code || ""]}
                height="40px"
                width="full"
                rounded={"md"}
                bgColor={isEditingSow ? undefined : inputDateAndSelectBgColor}
                onChange={(e) =>
                  handleInputChange(
                    "currency_code",
                    (e.target as HTMLInputElement).value,
                  )
                }
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
                      <Image boxSize="22px" w="36px" src={currency.flag} />
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            )}
          </ClipboardRoot>
          <ClipboardRoot w={"100%"} value={sowDetail?.type}>
            <ClipboardLabel>Type of SOW</ClipboardLabel>
            {!isEditingSow ? (
              <InputGroup
                width="full"
                endElement={<ClipboardIconButton me="-2" />}
              >
                <Input
                  disabled={!isEditingSow}
                  variant={"subtle"}
                  value={editedSowData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                />
              </InputGroup>
            ) : (
              <SelectRoot
                variant={"subtle"}
                collection={typeSowOptions}
                defaultValue={[sowDetail?.type || ""]}
                height="40px"
                width="full"
                rounded={"md"}
                bgColor={inputDateAndSelectBgColor}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    (e.target as HTMLInputElement).value,
                  )
                }
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
            )}
          </ClipboardRoot>
          <ClipboardRoot w={"100%"} value={sowDetail?.total_manday?.toString()}>
            <ClipboardLabel>Total Man Day</ClipboardLabel>
            <InputGroup
              width="full"
              endElement={<ClipboardIconButton me="-2" />}
            >
              <Input
                disabled
                variant={"subtle"}
                value={editedSowData.total_manday}
              />
            </InputGroup>
          </ClipboardRoot>
          <ClipboardRoot w={"100%"} value={sowDetail?.total_amount?.toString()}>
            <ClipboardLabel>Total Amount</ClipboardLabel>
            <InputGroup
              width="full"
              endElement={<ClipboardIconButton me="-2" />}
            >
              <Input
                disabled
                variant={"subtle"}
                value={editedSowData.total_amount}
              />
            </InputGroup>
          </ClipboardRoot>
        </Flex>
        <Flex w={"50%"} direction={"column"} gap={6}>
          <ClipboardRoot w={"100%"} value={sowDetail?.start_date}>
            <ClipboardLabel>Start Date</ClipboardLabel>
            {!isEditingSow ? (
              <InputGroup
                width="full"
                endElement={<ClipboardIconButton me="-2" />}
              >
                <Input
                  disabled={!isEditingSow}
                  variant={"subtle"}
                  value={editedSowData.start_date ?? ""}
                />
              </InputGroup>
            ) : (
              <Input
                type="date"
                width="full"
                border={"none"}
                bgColor={inputDateAndSelectBgColor}
                min={getCurrentDateTimes()}
                value={format(new Date(editedSowData.start_date), "MM/dd/yyyy")}
                onChange={(e) => {
                  const selectedDate = new Date(`${e.target.value}T00:00:00`)
                  const formattedDate = format(selectedDate, "MM/dd/yyyy")
                  handleInputChange("start_date", formattedDate)
                }}
              />
            )}
          </ClipboardRoot>
          <ClipboardRoot w={"100%"} value={sowDetail?.end_date}>
            <ClipboardLabel>End Date</ClipboardLabel>
            {!isEditingSow ? (
              <InputGroup
                width="full"
                endElement={<ClipboardIconButton me="-2" />}
              >
                <Input
                  disabled={!isEditingSow}
                  variant={"subtle"}
                  value={editedSowData.end_date}
                  onChange={(e) =>
                    handleInputChange("end_date", e.target.value)
                  }
                />
              </InputGroup>
            ) : (
              <Input
                type="date"
                width="full"
                border={"none"}
                bgColor={inputDateAndSelectBgColor}
                min={editedSowData.end_date}
                value={
                  editedSowData.end_date
                    ? editedSowData.end_date
                    : format(new Date(editedSowData.end_date), "MM/dd/yyyy")
                }
                onChange={(e) => {
                  const selectedDate = new Date(`${e.target.value}T00:00:00`)
                  const formattedDate = format(selectedDate, "MM/dd/yyyy")
                  handleInputChange("end_date", formattedDate)
                }}
              />
            )}
          </ClipboardRoot>
          <ClipboardRoot w={"100%"} value={sowDetail?.next_invoice_date}>
            <ClipboardLabel>Next Invoice Date</ClipboardLabel>
            <InputGroup
              width="full"
              endElement={<ClipboardIconButton me="-2" />}
            >
              <Input
                disabled={!isEditingSow}
                variant={"subtle"}
                value={invoiceIssueScheduleLists?.data[0]?.issue_date ?? ""}
                onChange={(e) =>
                  handleInputChange("next_invoice_date", e.target.value)
                }
              />
            </InputGroup>
          </ClipboardRoot>
          <ClipboardRoot
            w="100%"
            value={sowDetail?.sow_document_id ?? undefined}
          >
            <ClipboardLabel>Link To Document</ClipboardLabel>
            <InputGroup
              width="full"
              endElement={<ClipboardIconButton me="-2" />}
            >
              <Input
                disabled={!isEditingSow}
                variant="subtle"
                value={editedSowData.sow_document_id ?? ""}
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                onChange={(e) =>
                  handleInputChange("sow_document_id", e.target.value)
                }
              />
            </InputGroup>
          </ClipboardRoot>
          <ClipboardRoot
            w={"100%"}
            value={sowDetail?.onshore ? "true" : "false"}
          >
            <ClipboardLabel>Signed Parties</ClipboardLabel>
            {!isEditingSow ? (
              <InputGroup
                width="full"
                endElement={<ClipboardIconButton me="-2" />}
              >
                <Input
                  disabled
                  variant={"subtle"}
                  value={editedSowData.onshore ? "Onshore" : "Offshore"}
                  onChange={(e) => handleInputChange("onshore", e.target.value)}
                />
              </InputGroup>
            ) : (
              <HStack>
                <Checkbox
                  colorPalette={"blue"}
                  variant={"solid"}
                  backgroundColor={"gray.400"}
                  rounded={"md"}
                  checked={editedSowData.onshore}
                  onChange={(e) => {
                    const newValue = (e.target as HTMLInputElement).checked
                    setEditedSowData((prev) => ({
                      ...prev,
                      onshore: newValue,
                    }))
                  }}
                />
              </HStack>
            )}
          </ClipboardRoot>
        </Flex>
      </Box>
      <Box p={4} pt={0} flex="1" display="flex" flexDirection="column">
        <ClipboardRoot w={"100%"} value={sowDetail?.description ?? undefined}>
          <ClipboardLabel>Description</ClipboardLabel>
          <InputGroup width="full">
            <Box position="relative" width="full">
              <Textarea
                css={cssScrollBar}
                h={"200px"}
                variant={"subtle"}
                value={editedSowData.description ?? ""}
                resize="none"
                flex="1"
                minH="100px"
                overflowY="auto"
                pr={10}
                readOnly={!isEditingSow}
                color={descriptionTextColor}
                backgroundColor={inputDateAndSelectBgColor}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
              <ClipboardIconButton
                position="absolute"
                top="8px"
                right="8px"
                zIndex="1"
              />
            </Box>
          </InputGroup>
        </ClipboardRoot>
      </Box>
      <Box
        display={"flex"}
        gap={2}
        pr={4}
        pb={0}
        mb={4}
        justifyContent={"flex-end"}
        alignItems={"center"}
      >
        {isEditingSow ? (
          <Flex gap={2} justifyContent={"flex-end"} alignItems={"center"}>
            <DialogRoot closeOnInteractOutside={false} closeOnEscape={false}>
              <DialogTrigger asChild>
                <Button size={"xs"} colorPalette={"gray"}>
                  <MdOutlineCancel />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle color={"red"}>
                    Are you sure you want to cancel?
                  </DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <p>Data not saved will be lost.</p>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button
                      colorPalette={"blue"}
                      onClick={handleToggleEditingSow}
                    >
                      Agree
                    </Button>
                  </DialogActionTrigger>
                </DialogFooter>
                <DialogCloseTrigger />
              </DialogContent>
            </DialogRoot>
            <DialogRoot closeOnInteractOutside={false} closeOnEscape={false}>
              <DialogTrigger asChild>
                <Button size={"xs"} colorPalette={"green"}>
                  <MdOutlineCheckCircle />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle color={"red"}>
                    Are you sure you want to save changes?
                  </DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <p>Data will be saved.</p>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button
                      colorPalette={"blue"}
                      onClick={handleSaveEditedDataSow}
                    >
                      Agree
                    </Button>
                  </DialogActionTrigger>
                </DialogFooter>
                <DialogCloseTrigger />
              </DialogContent>
            </DialogRoot>
          </Flex>
        ) : (
          <Flex gap={2} justifyContent={"flex-end"} alignItems={"center"}>
            <Button
              size={"xs"}
              colorPalette={"blue"}
              onClick={handleToggleEditingSow}
            >
              <FiEdit size={"20px"} cursor={"pointer"} />
            </Button>
            <DialogRoot closeOnInteractOutside={false} closeOnEscape={false}>
              <DialogTrigger asChild>
                <Button
                  size={"xs"}
                  colorPalette={"red"}
                  onClick={handleDeleteSow}
                >
                  <MdOutlineDelete size={"24px"} cursor={"pointer"} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle color={"red"}>
                    Are you sure you want to delete this SOW?
                  </DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <p>Data will be deleted permanently.</p>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button
                      colorPalette={"blue"}
                      loading={isDeletingSow}
                      onClick={confirmToDelete}
                    >
                      Agree
                    </Button>
                  </DialogActionTrigger>
                </DialogFooter>
                <DialogCloseTrigger />
              </DialogContent>
            </DialogRoot>
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export default SowDetails
