import {
  type ProjectPublic,
  ProjectSowsService,
  type SOWPublic,
} from "@/client"
import BaseTable, {
  type BaseTableState,
  DefaultTableState,
  type HeaderTable,
} from "@/components/common/BaseTable"
import CreateSow from "@/components/sow/CreateSow"
import { useColorModeValue } from "@/components/ui/color-mode"
import { formatDate } from "@/utils"
import { Box, Button, HStack, Heading, Spinner, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { type CSSProperties, useState } from "react"
import { GoPlus } from "react-icons/go"
import { HiOutlineExternalLink } from "react-icons/hi"
const ProjectSOW = ({ projectDetail }: { projectDetail: ProjectPublic }) => {
  const nameColor = useColorModeValue("blue", "#FBA518")
  const buttonColor = useColorModeValue("blue.700", "blue.700")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.800")
  const [isCreateSowOpen, setIsCreateSowOpen] = useState(false)

  const [tableState, setTableState] = useState<Partial<BaseTableState>>({
    ...DefaultTableState,
    sort_order: "asc",
    page_size: 5,
  })
  const { data: projectSOWData, isFetching } = useQuery({
    queryKey: [
      "projectSOW",
      tableState.page_index,
      tableState.page_size,
      tableState.sort_by,
      tableState.sort_order,
    ],
    queryFn: async () => {
      const tmpData = await ProjectSowsService.getAllSows({
        pageIndex: tableState.page_index ?? 0,
        pageSize: tableState.page_size ?? 0,
        sortBy: tableState.sort_by ?? "",
        sortOrder: tableState.sort_order ?? "asc",
        projectId: projectDetail.id,
      })

      tmpData.data = tmpData.data?.map((item, index) => ({
        ...item,
        start_date: item.start_date ? formatDate(item.start_date) : "N/A",
        end_date: item.end_date ? formatDate(item.end_date) : "N/A",
        next_invoice_date: formatDate(item.next_invoice_date),
        sow_name: projectDetail.name
          ? `${projectDetail.name} ${index + 1}`
          : `SOW ${index}`,
      }))

      return tmpData
    },
  })

  const columns: HeaderTable[] = [
    {
      name: "SOW Name",
      key: "sow_name",
    },
    {
      name: "Start Date",
      key: "start_date",
    },
    {
      name: "End Date",
      key: "end_date",
    },
    {
      name: "Next Invoice Date",
      key: "next_invoice_date",
    },
  ]

  const customStyles: { [key: string]: CSSProperties } = {
    sow_name: {
      width: "40%",
      color: nameColor,
      cursor: "pointer",
      textDecoration: "none",
    },
    start_date: { width: "20%" },
    end_date: { width: "20%" },
    next_invoice_date: { width: "20%" },
  }

  const customRows = {
    sow_name: (value: string, rowData: SOWPublic) => (
      <Link
        to={`/projects/${projectDetail.id}/sows/${rowData.id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
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
        {value}
        <HiOutlineExternalLink size={16} />
      </Link>
    ),
  }

  return (
    <Box flex="1">
      <HStack justifyContent={"space-between"}>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} mb={5}>
          {"II. Project SOWs"}
        </Heading>
        <Button
          variant="outline"
          size="sm"
          rounded={"lg"}
          alignSelf={"flex-start"}
          bg={buttonColor}
          color={buttontextColor}
          _hover={{ background: buttonHoverColor }}
          onClick={() => setIsCreateSowOpen(true)}
        >
          <GoPlus /> Add SOW
        </Button>
      </HStack>
      {isFetching ? (
        <VStack colorPalette="teal">
          <Spinner color="colorPalette.600" />
          <Box color="colorPalette.600">Loading...</Box>
        </VStack>
      ) : (
        <BaseTable
          columns={columns}
          data={projectSOWData?.data ?? []}
          tableState={tableState}
          onTableStateChange={setTableState}
          customStyles={customStyles}
          customRows={customRows}
        />
      )}
      {isCreateSowOpen && (
        <CreateSow
          projectId={projectDetail.id}
          isOpen={isCreateSowOpen}
          setIsOpen={setIsCreateSowOpen}
        />
      )}
    </Box>
  )
}

export default ProjectSOW
