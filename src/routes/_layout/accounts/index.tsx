import { AccountsService } from "@/client/sdk.gen.ts"
import type { AccountPublic } from "@/client/types.gen.ts"
import AccountFormCreate from "@/components/accounts/forms/AccountFormCreate.tsx"
import AccountFormUpdate from "@/components/accounts/forms/AccountFormUpdate.tsx"
import AlertModal from "@/components/common/AlertModal.tsx"
import Pagination from "@/components/common/Pagination.tsx"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { useColorModeValue } from "@/components/ui/color-mode"
import { InputGroup } from "@/components/ui/input-group.tsx"
import useCustomToast from "@/hooks/useCustomToast.ts"
import { formatDate } from "@/utils.ts"
import {
  Box,
  Container,
  Flex,
  HStack,
  Input,
  Spinner,
  VStack,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { BiSolidTrashAlt } from "react-icons/bi"
import { FiEdit } from "react-icons/fi"
import { HiOutlineExternalLink } from "react-icons/hi"
import { IoIosSearch } from "react-icons/io"
import BaseTable, {
  type BaseTableState,
  type HeaderTable,
  DefaultTableState,
} from "../../../components/common/BaseTable.tsx"
export const Route = createFileRoute("/_layout/accounts/")({
  component: AccountManagement,
})

const AccountManagementTable = () => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useCustomToast()
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const accountNameColor = useColorModeValue("blue", "#4CC9FE")
  const iconEditHoveColor = useColorModeValue("blue", "#4A90E2")
  const searchColor = useColorModeValue("black", "white")
  const borderColor = useColorModeValue("gray.300", "gray.600")
  const [searchAccount, setSearchAccount] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedRow, setSelectedRow] = useState<AccountPublic | null>(null)
  const [openUpdateModal, setOpenUpdateModal] = useState(false)
  const [tableState, setTableState] = useState<BaseTableState>({
    ...DefaultTableState,
    sort_order: "",
    page_size: 10,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchAccount)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchAccount])

  const {
    data: accountsResponse,
    isFetching,
    isError,
  } = useQuery({
    queryKey: [
      "accounts",
      tableState.page_index,
      tableState.page_size,
      tableState.sort_by,
      tableState.sort_order,
      debouncedSearch,
    ],
    queryFn: async () => {
      return AccountsService.getAccounts({
        search: debouncedSearch.trim(),
        pageIndex: tableState.page_index ?? 0,
        pageSize: tableState.page_size ?? 10,
        sortBy: tableState.sort_by ?? "",
        sortOrder: tableState.sort_order ?? "",
      })
    },
  })

  const accounts = accountsResponse?.data || []
  const totalCount = accountsResponse?.count || 0

  const importantItems = useMemo(() => {
    return accounts.filter((item: any) => item.is_important)
  }, [accounts])

  const handleImportantItem = useCallback(
    async (row: any, isPin: boolean) => {
      const previousData = queryClient.getQueryData(["accounts"])

      queryClient.setQueryData(["accounts"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((item: any) =>
            item.id === row.id ? { ...item, is_important: isPin } : item,
          ),
        }
      })

      try {
        await AccountsService.markAccountAsImportant({
          accountId: row.id,
          pin: isPin,
        })

        showSuccess(
          isPin
            ? `Account "${row.account_name}" has been pinned successfully.`
            : `Account "${row.account_name}" has been unpinned successfully.`,
        )

        queryClient.invalidateQueries({ queryKey: ["accounts"] })
      } catch (error) {
        queryClient.setQueryData(["accounts"], previousData)
        showError("You cannot pin more than 5 accounts.")
      }
    },
    [queryClient, showError, showSuccess],
  )

  const handleDelete = useCallback(
    async (row: AccountPublic) => {
      try {
        await AccountsService.deleteAccount({
          id: row.id,
        })
        await queryClient.invalidateQueries({ queryKey: ["accounts"] })
        showSuccess("Account deleted successfully.")
      } catch (error) {
        showError("This account has projects, you cannot delete it.")
      }
    },
    [queryClient, showError, showSuccess],
  )

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
    account_name: {
      color: accountNameColor,
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
      name: "Account Name",
      key: "account_name",
    },
    {
      name: "Account Code",
      key: "company_code",
    },
    {
      name: "AM Name",
      key: "account_manager_name",
    },
    {
      name: "Email",
      key: "email",
    },
    {
      name: "Created Date",
      key: "created_at",
    },
    {
      name: "Overdue Invoices",
      key: "overdue_invoices",
    },
  ]

  const customRows = {
    account_name: (value: string, rowData: any) => (
      <Flex alignItems={"center"} gap={2}>
        <Link
          to={`/accounts/${rowData.id}`}
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
    account_manager_name: (value: string) => (
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
    created_at: (value: string) => <span>{formatDate(value)}</span>,
  }

  const renderRowActions = useCallback(
    (row: AccountPublic) => (
      <HStack justifyContent="center">
        <Box>
          <FiEdit
            size={18}
            onClick={() => {
              setSelectedRow(row)
              setOpenUpdateModal(true)
            }}
            style={{
              marginTop: "2px",
              cursor: "pointer",
              color: iconEditHoveColor,
              transition: "transform 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
            }}
          />
        </Box>
        <AlertModal
          title="Delete Account"
          bodyFirstLine="Are you sure you want to delete this account?"
          buttonContent="Delete"
          onClick={() => handleDelete(row)}
          buttonColorPalette="red"
          triggerButton={
            <BiSolidTrashAlt
              size={20}
              style={{
                marginTop: "9px",
                transition: "transform 0.2s ease-in-out",
                cursor: "pointer",
              }}
              color="red"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
            />
          }
        />
      </HStack>
    ),
    [handleDelete, iconEditHoveColor],
  )

  return (
    <Box bg={secBgColor} style={{ minHeight: "calc(100vh - 109px)" }}>
      {selectedRow && (
        <AccountFormUpdate
          data={selectedRow}
          isOpen={openUpdateModal}
          setIsOpen={setOpenUpdateModal}
        />
      )}
      <HStack justify="space-between" mb={4} mt={8} alignItems="center">
        <AccountFormCreate />
        <InputGroup
          startElement={<IoIosSearch size={20} color={searchColor} />}
        >
          <Input
            w="400px"
            rounded="full"
            border="1px solid"
            borderColor={borderColor}
            outline="none"
            placeholder="Search by Account Name, Email,... "
            _focus={{ borderColor: "blue.500" }}
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
          />
        </InputGroup>
      </HStack>

      {isFetching && !accounts.length ? (
        <VStack colorPalette="blue">
          <Spinner color="colorPalette.700" />
          <Box color="colorPalette.700">Loading...</Box>
        </VStack>
      ) : isError ? (
        <Box textAlign="center" p={4} color="red.500">
          Error loading accounts. Please try again.
        </Box>
      ) : (
        <BaseTable
          columns={table_header}
          data={accounts}
          tableState={tableState}
          renderRowActions={renderRowActions}
          onTableStateChange={handleTableStateChange}
          count={totalCount}
          customStyles={customStyles}
          customRows={customRows}
          importantItems={importantItems}
          onToggleImportantItem={handleImportantItem}
          maxHBaseTable="fit-content"
        />
      )}

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

function AccountManagement() {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Container maxW="full" bg={secBgColor} h="fit-content">
      <BreadcrumbRoot mt={4} size="lg">
        <BreadcrumbLink cursor="pointer" onClick={() => navigate({ to: "/" })}>
          CMS
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>
          {t("routes._layout.account.account-management.title")}
        </BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <AccountManagementTable />
    </Container>
  )
}

export default AccountManagement
