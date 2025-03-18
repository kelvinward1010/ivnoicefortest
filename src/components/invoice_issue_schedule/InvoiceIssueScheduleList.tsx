import {
  type InvoiceIssueSchedulesPublic,
  SowsInvoiceIssueSchedulesService,
} from "@/client"
import AlertModal from "@/components/common/AlertModal"
import {
  ActionBarContent,
  ActionBarRoot,
  ActionBarSelectionTrigger,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { cssScrollBar } from "@/constants/sow"
import useCustomToast from "@/hooks/useCustomToast"
import {
  HStack,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useState } from "react"
import { FiEdit } from "react-icons/fi"
import { IoIosAdd, IoMdClose } from "react-icons/io"
import { IoFilter } from "react-icons/io5"
import { MdOutlineDelete } from "react-icons/md"

const PAGE_SIZE = 3

interface InvoiceIssueScheduleListProps {
  sowId: string
}

const InvoiceIssueScheduleList = ({ sowId }: InvoiceIssueScheduleListProps) => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useCustomToast()
  const [open, setOpen] = useState<boolean>(false)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [invoiceDates, setInvoiceDates] = useState<string[]>([""])
  const [itemToUpdate, setItemToUpdate] = useState<string>("")
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [sortOrderInvoice, setSortOrderInvoice] = useState<string>("asc")

  const handleCloseDialog = () => {
    setOpen(false)
  }

  const { data, isFetching } = useQuery<InvoiceIssueSchedulesPublic>({
    queryKey: ["invoiceIssueList", sowId, pageIndex, sortOrderInvoice],
    queryFn: async () => {
      const response =
        await SowsInvoiceIssueSchedulesService.getAllInvoiceIssueSchedules({
          sowId,
          pageSize: PAGE_SIZE,
          pageIndex,
          sortOrder: sortOrderInvoice,
        })
      return {
        count: response.count ?? 0,
        data: response.data.map((invoice) => ({
          ...invoice,
          issue_date: invoice.issue_date
            ? format(new Date(invoice.issue_date), "MM/dd/yyyy")
            : "",
        })),
      }
    },
  })

  const { mutateAsync: createInvoiceIssueSchedule, isPending } = useMutation({
    mutationFn: async (newInvoice: { sowId: string; requestBody: any }) => {
      return await SowsInvoiceIssueSchedulesService.createInvoiceIssueSchedule(
        newInvoice,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoiceIssueList", sowId, pageIndex],
      })
    },
    onError: () => {
      showError("Invoice issue schedule creation failed")
    },
  })

  const { mutateAsync: updateInvoiceIssueSchedule, isPending: isUpdating } =
    useMutation({
      mutationFn: async (updatedInvoice: {
        sowId: string
        iisId: string
        requestBody: any
      }) => {
        return await SowsInvoiceIssueSchedulesService.updateInvoiceIssueSchedule(
          updatedInvoice,
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["invoiceIssueList", sowId, pageIndex],
        })
        handleCloseDialog()
      },
      onError: () => {
        showError("Invoice issue schedule update failed")
      },
    })

  const { mutateAsync: deleteInvoiceIssueSchedule } = useMutation({
    mutationFn: async (invoiceId: string) => {
      return await SowsInvoiceIssueSchedulesService.deleteInvoiceIssueSchedule({
        sowId,
        iisId: invoiceId,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["invoiceIssueList", sowId, pageIndex],
      })
      const updatedData = queryClient.getQueryData<InvoiceIssueSchedulesPublic>(
        ["invoiceIssueList", sowId, pageIndex],
      )
      if (updatedData?.data.length === 0 && pageIndex > 0) {
        setPageIndex(pageIndex - 1)
      }
    },
    onError: () => {
      showError("Failed to delete invoice issue schedule")
    },
  })

  const handleCreateInvoiceIssueSchedule = async () => {
    try {
      if (itemToUpdate) {
        await updateInvoiceIssueSchedule({
          sowId,
          iisId: itemToUpdate,
          requestBody: { issue_date: new Date(invoiceDates[0]).toISOString() },
        })
      } else {
        await Promise.all(
          invoiceDates
            .filter((date) => date)
            .map((date) =>
              createInvoiceIssueSchedule({
                sowId,
                requestBody: { issue_date: new Date(date).toISOString() },
              }),
            ),
        )
      }
      showSuccess(
        `${itemToUpdate ? "Invoice updated" : "Invoices created"} successfully`,
      )
      setInvoiceDates([""])
      setItemToUpdate("")
      handleCloseDialog()
    } catch {
      showError("Failed to create or update invoices")
    }
  }

  const handleUpdateInvoice = (invoiceId: string) => {
    const invoice = data?.data.find((invoice) => invoice.id === invoiceId)
    if (!invoice) return
    setItemToUpdate(invoiceId)
    const formattedDate = invoice.issue_date
      ? format(new Date(invoice.issue_date), "yyyy-MM-dd")
      : ""
    setInvoiceDates([formattedDate])
    setOpen(true)
  }

  const handleDeleteInvoice = (index: number) => {
    setItemToDelete(index)
  }

  const confirmDelete = async (invoiceId: string) => {
    if (itemToDelete !== null) {
      await deleteInvoiceIssueSchedule(invoiceId)
      setItemToDelete(null)
    }
  }

  const [selection, setSelection] = useState<string[]>([])
  const hasSelection = selection.length > 0
  const indeterminate =
    hasSelection && data && selection.length < data.data.length

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selection.map(async (issue_date) => {
          const invoice = data?.data.find(
            (invoice) => invoice.issue_date === issue_date,
          )
          if (invoice) {
            await deleteInvoiceIssueSchedule(invoice.id)
          }
        }),
      )
      showSuccess(
        `${selection.length > 1 ? "Invoices" : "Invoice"} deleted successfully`,
      )
      setSelection([])
    } catch {
      showError(
        `Failed to delete ${selection.length > 1 ? "invoices" : "invoice"} selected invoices`,
      )
    }
  }

  const loadingRows = Array.from({ length: PAGE_SIZE }).map((_, index) => (
    <Table.Row key={`loading-${index}`}>
      <Table.Cell>
        <Skeleton height="20px" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton height="20px" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton height="20px" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton height="20px" />
      </Table.Cell>
    </Table.Row>
  ))

  return (
    <Stack
      w="full"
      h={"100%"}
      p={4}
      gap={4}
      rounded="md"
      border="none"
      shadow="md"
    >
      <HStack justifyContent="space-between">
        <Heading fontWeight="semibold" fontSize="16px" lineHeight="1.25rem">
          Invoice Issue Schedule List
        </Heading>
        <DialogRoot
          size={"sm"}
          placement={"center"}
          motionPreset={"scale"}
          closeOnEscape={false}
          closeOnInteractOutside={false}
          open={open}
          onOpenChange={(isOpen) => setOpen(isOpen.open)}
        >
          <DialogTrigger asChild>
            <Button
              size={"xs"}
              rounded={"md"}
              colorPalette={"blue"}
              onClick={() => {
                setItemToUpdate("")
                setInvoiceDates([""])
                setOpen(true)
              }}
            >
              <IoIosAdd /> Add
            </Button>
          </DialogTrigger>
          <DialogContent
            minH={"200px"}
            maxH={"500px"}
            overflowY="auto"
            css={cssScrollBar}
          >
            <DialogHeader pb={0}>
              <DialogTitle>Add Invoice Issue Schedule</DialogTitle>
              <AlertModal
                onClick={handleCloseDialog}
                triggerButton={
                  <HStack position={"absolute"} right={5} top={5}>
                    <IoMdClose size={"24px"} cursor={"pointer"} />
                  </HStack>
                }
                title="Are you sure you want to leave?"
                bodyFirstLine="Your action is not completed"
                bodySecondLine="Data not saved will be lost"
                buttonContent="Agree"
              />
            </DialogHeader>
            <DialogBody>
              <Stack gap={2} w={"full"}>
                <HStack
                  justifyContent="space-between"
                  alignItems={"center"}
                  pt={0}
                >
                  <Text fontWeight="semibold">Invoice Issue Date</Text>
                  <Button
                    width={"32px"}
                    height={"38px"}
                    colorPalette="cyan"
                    onClick={() => setInvoiceDates([...invoiceDates, ""])}
                  >
                    <IoIosAdd />
                  </Button>
                </HStack>
                {invoiceDates.map((date, index) => (
                  <HStack key={index}>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        const newDates = [...invoiceDates]
                        newDates[index] = e.target.value
                        setInvoiceDates(newDates)
                      }}
                    />
                    {invoiceDates.length > 1 && (
                      <Button
                        width={"32px"}
                        height={"38px"}
                        colorPalette="red"
                        onClick={() => {
                          setInvoiceDates(
                            invoiceDates.filter((_, i) => i !== index),
                          )
                        }}
                      >
                        <IoMdClose />
                      </Button>
                    )}
                  </HStack>
                ))}
              </Stack>
              <Button
                mt={4}
                size={"xs"}
                rounded={"md"}
                w={"50px"}
                float={"right"}
                colorPalette={"blue"}
                loading={itemToUpdate ? isUpdating : isPending}
                onClick={handleCreateInvoiceIssueSchedule}
              >
                Save
              </Button>
            </DialogBody>
          </DialogContent>
        </DialogRoot>
      </HStack>
      <>
        <Table.Root
          size={"sm"}
          rounded="md"
          variant="outline"
          showColumnBorder
          stickyHeader
          interactive
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader w="6">
                <Checkbox
                  top="1"
                  aria-label="Select all rows"
                  checked={
                    indeterminate ? "indeterminate" : selection.length > 0
                  }
                  onCheckedChange={(changes) => {
                    setSelection(
                      changes.checked
                        ? (data?.data?.map((item) => item.issue_date ?? "") ??
                            [])
                        : [],
                    )
                  }}
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader>No</Table.ColumnHeader>
              <Table.ColumnHeader>
                <HStack gap={8}>
                  Invoice Issue Date
                  <HStack gap={2}>
                    <IoFilter size={"22px"} />
                    <NativeSelect.Root size={"xs"} variant={"outline"}>
                      <NativeSelect.Field
                        defaultValue={"asc"}
                        value={sortOrderInvoice}
                        onChange={(e) => setSortOrderInvoice(e.target.value)}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </HStack>
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isFetching
              ? loadingRows
              : data?.data.map((invoice, index) => (
                  <Table.Row
                    key={invoice.id}
                    data-selected={
                      selection.includes(invoice.issue_date ?? "")
                        ? ""
                        : undefined
                    }
                  >
                    <Table.Cell>
                      <Checkbox
                        top="1"
                        aria-label="Select row"
                        checked={
                          invoice.issue_date
                            ? selection.includes(invoice.issue_date)
                            : false
                        }
                        onCheckedChange={(changes) => {
                          setSelection((prev) =>
                            changes.checked
                              ? [...prev, invoice.issue_date].filter(
                                  (date): date is string =>
                                    date !== null && date !== undefined,
                                )
                              : selection.filter(
                                  (issue_date) =>
                                    issue_date !== invoice.issue_date,
                                ),
                          )
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell>{index + 1 + pageIndex * PAGE_SIZE}</Table.Cell>
                    <Table.Cell>{`Invoice of ${invoice.issue_date ?? ""}`}</Table.Cell>
                    <Table.Cell>
                      <HStack gap={2} justifyContent={"flex-end"}>
                        <Button
                          size={"xs"}
                          p={0}
                          colorPalette={"blue"}
                          disabled={
                            invoice.issue_date
                              ? selection.includes(invoice.issue_date)
                              : false
                          }
                          onClick={() => handleUpdateInvoice(invoice.id)}
                        >
                          <FiEdit
                            size={"14px"}
                            cursor={"pointer"}
                            style={{
                              float: "right",
                              color: "white",
                              transition: "transform 0.2s ease-in-out",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.2)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)"
                            }}
                          />
                        </Button>
                        <DialogRoot
                          closeOnInteractOutside={false}
                          closeOnEscape={false}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size={"xs"}
                              p={0}
                              colorPalette={"red"}
                              disabled={
                                invoice.issue_date
                                  ? selection.includes(invoice.issue_date)
                                  : false
                              }
                              onClick={() => handleDeleteInvoice(index)}
                            >
                              <MdOutlineDelete
                                size={"20px"}
                                cursor={"pointer"}
                                style={{
                                  float: "right",
                                  color: "white",
                                  transition: "transform 0.2s ease-in-out",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.2)"
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)"
                                }}
                              />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle color={"red"}>
                                Are you sure you want to delete this Invoice of{" "}
                                {invoice.issue_date}?
                              </DialogTitle>
                            </DialogHeader>
                            <DialogBody>
                              <p>Data will be deleted permanently.</p>
                            </DialogBody>
                            <DialogFooter>
                              <DialogActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogActionTrigger>
                              <DialogActionTrigger asChild>
                                <Button
                                  colorPalette={"blue"}
                                  onClick={() =>
                                    itemToDelete !== null &&
                                    confirmDelete(data?.data[itemToDelete]?.id)
                                  }
                                >
                                  Agree
                                </Button>
                              </DialogActionTrigger>
                            </DialogFooter>
                            <DialogCloseTrigger />
                          </DialogContent>
                        </DialogRoot>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
        </Table.Root>
        <ActionBarRoot open={hasSelection}>
          <ActionBarContent>
            <ActionBarSelectionTrigger>
              {selection.length} selected
            </ActionBarSelectionTrigger>
            <ActionBarSeparator />
            <DialogRoot closeOnInteractOutside={false} closeOnEscape={false}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Delete <MdOutlineDelete style={{ color: "red" }} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle color="red">
                    Are you sure you want to delete {selection.length} selected
                    invoices?
                  </DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <p>These invoices will be permanently deleted.</p>
                  <p>This action cannot be undone.</p>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogActionTrigger>
                  <DialogActionTrigger asChild>
                    <Button colorPalette="blue" onClick={handleDeleteSelected}>
                      Agree
                    </Button>
                  </DialogActionTrigger>
                </DialogFooter>
                <DialogCloseTrigger />
              </DialogContent>
            </DialogRoot>
          </ActionBarContent>
        </ActionBarRoot>
      </>
      <HStack w="full" justifyContent="space-between" alignItems="center">
        <PaginationRoot
          size="xs"
          variant="solid"
          count={data ? Math.ceil(data.count / PAGE_SIZE) : 0}
          pageSize={1}
          page={pageIndex + 1}
          onPageChange={(e) => {
            if ("page" in e && typeof e.page === "number") {
              setPageIndex(e.page - 1)
            }
          }}
        >
          <HStack wrap="wrap">
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </HStack>
        </PaginationRoot>
        <Text fontSize={"sm"} fontWeight={"medium"} userSelect={"none"}>
          Lines per page: {data?.data.length === 1 ? "1" : PAGE_SIZE}
        </Text>
      </HStack>
    </Stack>
  )
}

export default InvoiceIssueScheduleList
