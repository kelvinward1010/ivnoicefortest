import { TriangleDownIcon, TriangleUpIcon, UpDownIcon } from "@chakra-ui/icons"
import { Flex, Icon, Table, Text } from "@chakra-ui/react"
import type React from "react"
import { memo, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { BsPinAngle, BsPinFill } from "react-icons/bs"
import { FiInbox } from "react-icons/fi"
import { useColorModeValue } from "../ui/color-mode.tsx"

export type HeaderTable = {
  name: string
  key: string
  render?: (row: any) => React.ReactNode
}

export type BaseTableState = {
  selected_items?: any[]
  sort_by?: string
  sort_order?: "asc" | "desc" | ""
  page_index?: number
  page_size?: number
}

export const DefaultTableState: BaseTableState = {
  selected_items: [],
  sort_by: "",
  sort_order: "",
  page_index: 0,
  page_size: 10,
}

interface BaseTableProps<T extends object> {
  columns: HeaderTable[]
  data?: T[]
  tableState?: Partial<BaseTableState>
  onTableStateChange?: (state: BaseTableState) => void
  renderRowActions?: (row: T) => React.ReactNode
  hideCheckboxes?: boolean
  hideSortButton?: boolean
  count?: number
  customRows?: { [key: string]: (value: any, rowData: any) => React.ReactNode }
  customStyles?: { [key: string]: React.CSSProperties }
  onToggleImportantItem?: (row: T, isPin: boolean) => void
  importantItems?: any[]
  maxHBaseTable?: string
}

type DataRow = { [key: string]: any; id: string }

const BaseTable = <T extends DataRow>({
  columns,
  data = [],
  tableState = DefaultTableState,
  onTableStateChange,
  renderRowActions,
  hideCheckboxes = false,
  hideSortButton = false,
  customRows = {},
  customStyles = {},
  importantItems = [],
  onToggleImportantItem,
  maxHBaseTable,
}: BaseTableProps<T>) => {
  const { t } = useTranslation()
  const { sort_by, sort_order } = tableState

  const tableBg = useColorModeValue("white", "#2D3748")
  const rowHoverBg = useColorModeValue("gray.300", "#4A5568")
  const textColor = useColorModeValue("black", "#E2E8F0")
  const iconColor = useColorModeValue("black", "white")
  const tableColorNoData = useColorModeValue("white", "#1A202C")

  const updateTableState = useCallback(
    (newState: BaseTableState) => {
      onTableStateChange?.(newState)
    },
    [onTableStateChange],
  )

  const handleSort = useCallback(
    (columnKey: string) => {
      updateTableState({
        ...tableState,
        sort_by:
          sort_by === columnKey && sort_order === "desc" ? "" : columnKey,
        sort_order:
          sort_by === columnKey
            ? sort_order === "asc"
              ? "desc"
              : sort_order === "desc"
                ? ""
                : "asc"
            : "asc",
      })
    },
    [sort_by, sort_order, tableState, updateTableState],
  )

  const isRowPinned = useCallback(
    (rowId: string) => {
      return Boolean(importantItems.some((item) => item.id === rowId))
    },
    [importantItems],
  )

  const renderHeaders = useMemo(
    () => (
      <Table.Row>
        {!hideCheckboxes && importantItems && onToggleImportantItem && (
          <Table.ColumnHeader textAlign="center">Pin</Table.ColumnHeader>
        )}
        {columns.map((column, index) => (
          <Table.ColumnHeader
            key={index}
            style={{ textAlign: "center" }}
            onClick={!hideSortButton ? () => handleSort(column.key) : undefined}
            cursor={hideSortButton ? "default" : "pointer"}
            userSelect="none"
          >
            {column.name}
            {!hideSortButton &&
              (sort_by === column.key ? (
                sort_order === "asc" ? (
                  <TriangleUpIcon style={{ marginLeft: "4px" }} />
                ) : sort_order === "desc" ? (
                  <TriangleDownIcon style={{ marginLeft: "4px" }} />
                ) : (
                  <UpDownIcon style={{ marginLeft: "4px" }} />
                )
              ) : (
                <UpDownIcon style={{ marginLeft: "10px" }} />
              ))}
          </Table.ColumnHeader>
        ))}
        {renderRowActions && (
          <Table.ColumnHeader textAlign="center" width={120}>
            {t("common.BaseTable.table_actions")}
          </Table.ColumnHeader>
        )}
      </Table.Row>
    ),
    [
      columns,
      handleSort,
      hideCheckboxes,
      hideSortButton,
      importantItems,
      onToggleImportantItem,
      renderRowActions,
      sort_by,
      sort_order,
      t,
    ],
  )

  const emptyState = useMemo(
    () => (
      <Table.Row>
        <Table.Cell
          bg={tableColorNoData}
          colSpan={
            columns.length +
            (!hideCheckboxes ? 1 : 0) +
            (renderRowActions ? 1 : 0)
          }
          textAlign="center"
          width="100%"
        >
          <Flex direction="column" align="center" justify="center" py={10}>
            <Icon as={FiInbox} boxSize={12} color={textColor} />
            <Text color={textColor} fontSize="lg" mt={2}>
              {t("common.BaseTable.table_no_data")}
            </Text>
          </Flex>
        </Table.Cell>
      </Table.Row>
    ),
    [
      columns.length,
      hideCheckboxes,
      renderRowActions,
      t,
      tableColorNoData,
      textColor,
    ],
  )

  const TableRow = memo(({ row }: { row: T }) => (
    <Table.Row key={row.id} _hover={{ bg: rowHoverBg }} bg={tableBg}>
      {!hideCheckboxes && importantItems && onToggleImportantItem && (
        <Table.Cell width={10} padding={3}>
          {row.pinned_at || isRowPinned(row.id) ? (
            <BsPinFill
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
              style={{ cursor: "pointer", color: iconColor }}
              onClick={() => onToggleImportantItem(row, false)}
            />
          ) : (
            <BsPinAngle
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
              style={{ cursor: "pointer", color: iconColor }}
              onClick={() => onToggleImportantItem(row, true)}
            />
          )}
        </Table.Cell>
      )}
      {columns.map((column) => (
        <Table.Cell
          key={column.key}
          textAlign="left"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          style={{
            height: "50px",
            padding: "2",
            fontSize: "13px",
            ...(customStyles[column.key] || {}),
          }}
          color={textColor}
        >
          {customRows[column.key]
            ? customRows[column.key](row[column.key], row)
            : row[column.key]}
        </Table.Cell>
      ))}
      {renderRowActions && (
        <Table.Cell padding={1}>{renderRowActions(row)}</Table.Cell>
      )}
    </Table.Row>
  ))

  TableRow.displayName = "TableRow"

  return (
    <>
      <Table.ScrollArea
        rounded="mb"
        maxHeight={maxHBaseTable ?? "450px"}
        minHeight="auto"
        overflowY="auto"
      >
        <Table.Root size="md" stickyHeader showColumnBorder variant="outline">
          <Table.Header>{renderHeaders}</Table.Header>

          <Table.Body>
            {data.length > 0
              ? data.map((row) => <TableRow key={row.id} row={row} />)
              : emptyState}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}

export default memo(BaseTable) as typeof BaseTable
