import AlertModal from "@/components/common/AlertModal"
import BaseTable, {
  type BaseTableState,
  DefaultTableState,
  type HeaderTable,
} from "@/components/common/BaseTable"
import Pagination from "@/components/common/Pagination"
import { useColorModeValue } from "@/components/ui/color-mode"
import { InvoiceStatusEnum } from "@/constants/invoice"
import { formatDate } from "@/utils"
import { Box, Flex, HStack } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { useCallback, useMemo, useState } from "react"
import { FiEdit } from "react-icons/fi"
import { HiOutlineExternalLink } from "react-icons/hi"
import { MdDelete } from "react-icons/md"

const accountsfake: any[] = [
  {
    id: "1",
    invoice_name: "Invoice 001",
    invoice_code: "INV-2025-001",
    sow_no: "SOW-123",
    account_name: "Công ty ABC",
    status: "PAID",
    issue_date: "2025-01-15",
    due_date: "2025-02-15",
    payment_date: "2025-02-10",
    is_important: true,
  },
  {
    id: "2",
    invoice_name: "Invoice 002",
    invoice_code: "INV-2025-002",
    sow_no: "SOW-456",
    account_name: "Công ty XYZ",
    status: "UNPAID",
    issue_date: "2025-02-01",
    due_date: "2025-03-01",
    payment_date: "",
    is_important: false,
  },
  {
    id: "3",
    invoice_name: "Invoice 003",
    invoice_code: "INV-2025-003",
    sow_no: "SOW-789",
    account_name: "Công ty DEF",
    status: "OVERDUE",
    issue_date: "2024-12-10",
    due_date: "2025-01-10",
    payment_date: "",
    is_important: false,
  },
  {
    id: "4",
    invoice_name: "Invoice 004",
    invoice_code: "INV-2025-004",
    sow_no: "SOW-101",
    account_name: "Công ty XYZ",
    status: "DRAFT",
    issue_date: "2025-01-15",
    due_date: "2025-02-15",
    payment_date: "",
    is_important: false,
  },
]

export const InvoiceManagementTable = () => {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const invoiceNameColor = useColorModeValue("blue", "#4CC9FE")
  const iconEditHoveColor = useColorModeValue("blue", "#4A90E2")
  const [tableState, setTableState] = useState<BaseTableState>({
    ...DefaultTableState,
    sort_order: "",
    page_size: 10,
  })
  const accounts: any[] = accountsfake ?? []
  const totalCount = accounts.length ?? 0

  const importantItems = useMemo(() => {
    return accounts.filter((item: any) => item.is_important)
  }, [accounts])

  const onPageChange = useCallback((newPage: number) => {
    setTableState((prev) => ({
      ...prev,
      page_index: newPage - 1,
    }))
  }, [])

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setTableState((prev) => ({
      ...prev,
      page_index: 0,
      page_size: newPageSize,
    }))
  }, [])

  const handleTableStateChange = useCallback((newState: BaseTableState) => {
    setTableState(newState)
  }, [])

  const customStyles = {
    invoice_name: {
      color: invoiceNameColor,
      cursor: "pointer",
      textDecoration: "none",
      width: "200px",
    },
    email: {
      width: "200px",
    },
    created_at: {
      width: "200px",
    },
    company_code: {
      width: "200px",
    },
  }

  const table_header: HeaderTable[] = [
    {
      name: "Invoice Name",
      key: "invoice_name",
    },
    {
      name: "Invoice No",
      key: "invoice_code",
    },
    {
      name: "SOW No",
      key: "sow_no",
    },
    {
      name: "Account Name",
      key: "account_name",
    },
    {
      name: "Status",
      key: "status",
    },
    {
      name: "Issue Date",
      key: "issue_date",
    },
    {
      name: "Due Date",
      key: "due_date",
    },
    {
      name: "Payment Date",
      key: "payment_date",
    },
  ]

  const handleImportantItem = useCallback(() => {}, [])

  const customRows = {
    invoice_name: (value: string, rowData: any) => (
      <Flex alignItems={"center"} gap={2}>
        <Link
          to={`/invoices/${rowData.id}`}
          style={{
            gap: "6px",
            maxWidth: "150px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textDecoration: "none",
            fontWeight: 500,
          }}
          onMouseEnter={(e: any) => {
            e.currentTarget.style.textDecoration = "underline"
          }}
          onMouseLeave={(e: any) => {
            e.currentTarget.style.textDecoration = "none"
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </span>
        </Link>
        <HiOutlineExternalLink size={16} />
      </Flex>
    ),
    account_name: (value: string) => (
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    ),
    issue_date: (value: string) => <span>{formatDate(value)}</span>,
    due_date: (value: string) => <span>{formatDate(value)}</span>,
    payment_date: (value: string) => <span>{formatDate(value)}</span>,
  }

  const renderRowActions = useCallback(
    (row: any) => {
      const isDeletable = row.status === InvoiceStatusEnum.DRAFT

      return (
        <HStack justifyContent="center">
          <Box>
            <FiEdit
              size={18}
              onClick={() => {}}
              style={{
                cursor: "pointer",
                color: iconEditHoveColor,
                transition: "transform 0.2s ease-in-out",
                marginTop: "2px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
            />
          </Box>

          {isDeletable ? (
            <AlertModal
              onClick={() => {}}
              triggerButton={
                <MdDelete
                  size={20}
                  style={{
                    cursor: "pointer",
                    color: "red",
                    marginTop: "9px",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.2)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                />
              }
              buttonColorPalette="red"
              title="Delete Invoice"
              bodyFirstLine="Are you sure you want to delete this invoice?"
              bodySecondLine="Invoice cannot be recovered"
              buttonContent="Delete"
            />
          ) : (
            <MdDelete
              size={20}
              style={{
                cursor: "not-allowed",
                color: "red",
                transition: "transform 0.2s ease-in-out",
                opacity: "0.4",
              }}
            />
          )}
        </HStack>
      )
    },
    [iconEditHoveColor],
  )

  return (
    <Box bg={secBgColor} mt={10} style={{ minHeight: "calc(100vh - 109px)" }}>
      <BaseTable
        columns={table_header}
        data={accounts}
        customRows={customRows}
        tableState={tableState}
        onTableStateChange={handleTableStateChange}
        count={totalCount}
        customStyles={customStyles}
        importantItems={importantItems}
        onToggleImportantItem={handleImportantItem}
        renderRowActions={renderRowActions}
        maxHBaseTable="fit-content"
      />
      <Box mt={4}>
        <Pagination
          count={totalCount}
          currentPage={(tableState.page_index ?? 0) + 1}
          onPageChange={onPageChange}
          pageSize={tableState.page_size ?? 10}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </Box>
  )
}
