import { type ProjectPublic, ProjectsService } from "@/client"
import AlertModal from "@/components/common/AlertModal.tsx"
import BaseTable, {
  DefaultTableState,
  type HeaderTable,
  type BaseTableState,
} from "@/components/common/BaseTable"
import Pagination from "@/components/common/Pagination"
import ProjectFormCreate from "@/components/projects/forms/ProjectFormCreate"
import ProjectFormUpdate from "@/components/projects/forms/ProjectFormUpdate"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { SelectTrigger, SelectValueText } from "@/components/ui/select"
import { listStatus, statusStyles } from "@/constants/project.tsx"
import useCustomToast from "@/hooks/useCustomToast"
import { ProjectStatusEnum } from "@/types/project"
import { formatDate } from "@/utils"
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  Spinner,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FiEdit } from "react-icons/fi"
import { HiOutlineExternalLink } from "react-icons/hi"
import { IoIosSearch } from "react-icons/io"
import { MdDelete } from "react-icons/md"

export const Route = createFileRoute("/_layout/projects/")({
  component: ProjectManagement,
})
function ProjectManagementTable() {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useCustomToast()
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const projectNameColor = useColorModeValue("blue", "#4CC9FE")
  const borderColor = useColorModeValue("gray.300", "gray.600")
  const iconEditHoveColor = useColorModeValue("blue", "#4A90E2")
  const searchColor = useColorModeValue("black", "white")
  const MaxHeight = "40px"
  const [searchProject, setSearchProject] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState(searchProject)
  const [selectedRow, setSelectedRow] = useState<ProjectPublic | null>(null)
  const [openUpdateModal, setOpenUpdateModal] = useState(false)
  const [tableState, setTableState] = useState<Partial<BaseTableState>>({
    ...DefaultTableState,
    sort_order: "asc",
    page_size: 10,
  })
  const [startDate, setStartDate] = useState<string | null>("")
  const [endDate, setEndDate] = useState<string | null>("")
  const [statusProject, setStatusProject] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchProject)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [searchProject])

  const { data: projectsRespone, isFetching } = useQuery({
    queryKey: [
      "projects",
      tableState.page_index,
      tableState.page_size,
      tableState.sort_by,
      tableState.sort_order,
      debouncedSearch,
      statusProject,
    ],

    queryFn: async () => {
      const tmpData = await ProjectsService.getProjects({
        search: debouncedSearch.trim(),
        pageIndex: tableState.page_index ?? 0,
        pageSize: tableState.page_size ?? 0,
        sortBy: tableState.sort_by ?? "",
        sortOrder: tableState.sort_order ?? "asc",
        status: statusProject,
        startDate: startDate || null,
        endDate: endDate || null,
      })

      for (let index = 0; index < tmpData?.data?.length; index++) {
        if (tmpData.data[index].start_date) {
          tmpData.data[index].start_date = formatDate(
            tmpData.data[index].start_date ?? "",
          )
        }
        if (tmpData.data[index].end_date) {
          tmpData.data[index].end_date = formatDate(
            tmpData.data[index].end_date ?? "",
          )
        }
        if (tmpData.data[index].next_invoice_date) {
          tmpData.data[index].next_invoice_date = formatDate(
            tmpData.data[index].next_invoice_date ?? "",
          )
        }
      }
      return tmpData
    },
  })

  const projects = projectsRespone?.data || []
  const totalCount = projectsRespone?.count || 0

  const importantList = useMemo(() => {
    return projects.filter((item: any) => item.isPinned)
  }, [projects])

  const handleImportantItem = useCallback(
    async (row: any, isPin: boolean) => {
      const previousData = queryClient.getQueryData(["projects"])

      queryClient.setQueryData(["projects"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((item: any) =>
            item.id === row.id ? { ...item, is_important: isPin } : item,
          ),
        }
      })

      try {
        await ProjectsService.pinMark({
          projectId: row.id,
          isPinned: isPin,
        })
        showSuccess(
          isPin
            ? `Project "${row.name}" has been pinned successfully.`
            : `Projects "${row.name}" has been unpinned successfully.`,
        )
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        })
      } catch (error) {
        queryClient.setQueryData(["projects"], previousData)
        showError("You cannot pin more than 5 projects.")
      }
    },
    [queryClient, showError, showSuccess],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchProject(e.target.value)
  }

  const handleFilter = useCallback(async () => {
    if (startDate && endDate && startDate > endDate) {
      showError("The start date cannot be greater than the end date")
      return
    }

    const tmpData = await ProjectsService.getProjects()
    queryClient.invalidateQueries({
      queryKey: ["projects"],
    })

    return tmpData
  }, [queryClient, startDate, endDate, showError])

  const handleClearFilter = useCallback(async () => {
    setStartDate(null)
    setEndDate(null)

    const tmpData = await ProjectsService.getProjects()
    queryClient.invalidateQueries({
      queryKey: ["projects"],
    })
    return tmpData
  }, [queryClient])

  const onPageChange = useCallback((newPage: number) => {
    setTableState((prevState) => ({
      ...prevState,
      page_index: newPage - 1,
    }))
  }, [])

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setTableState((prevState) => ({
      ...prevState,
      page_size: newPageSize,
    }))
  }, [])

  const handleTableStateChange = useCallback((newState: BaseTableState) => {
    setTableState(newState)
  }, [])

  const table_header: HeaderTable[] = [
    {
      name: "Project Name",
      key: "name",
    },
    {
      name: "Account Name",
      key: "account_name",
    },
    {
      name: "PM Name",
      key: "pm_name",
    },
    {
      name: "Status",
      key: "status",
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

  const customStyles = {
    name: {
      color: projectNameColor,
      cursor: "pointer",
      textDecoration: "none",
    },
  }

  const customRows = {
    name: (value: string, rowData: any) => (
      <Flex alignItems={"center"} gap={2} flexDirection={"row"} w={200}>
        <Link
          to={`/projects/${rowData.id}`}
          style={{
            gap: "6px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: "170px",
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
        </Link>
        <HiOutlineExternalLink size={16} />
      </Flex>
    ),
    status: (value: ProjectStatusEnum) => (
      <span
        style={{
          backgroundColor: statusStyles[value].backgroundColor,
          width: "100%",
          display: "inline-block",
          textAlign: "center",
          padding: "2px",
          borderRadius: "4px",
          color: statusStyles[value].textColor,
        }}
      >
        {statusStyles[value].label}
      </span>
    ),
    account_name: (value: string) => (
      <Flex maxW={200}>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </span>
      </Flex>
    ),
    pm_name: (value: string) =>
      value ? (
        <Flex maxW={150}>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </span>
        </Flex>
      ) : (
        "N/A"
      ),
    start_date: (value: string) => (value ? value : "N/A"),
    end_date: (value: string) => (value ? value : "N/A"),
    next_invoice_date: (value: string) => (value ? value : "N/A"),
  }

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await ProjectsService.deleteProjectById({ projectId: projectId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      showSuccess("Project deleted successfully.")
    },
    onError: (error: unknown) => {
      showError(
        error instanceof Error
          ? error.message
          : "Only projects with status 'DRAFT' can be deleted.",
      )
    },
  })

  const renderRowActions = useCallback(
    (row: any) => {
      const isDeletable = row.status === ProjectStatusEnum.DRAFT

      return (
        <HStack justifyContent="center">
          <Box>
            <FiEdit
              size={18}
              onClick={() => {
                setOpenUpdateModal(true)
                setSelectedRow(row)
              }}
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
              onClick={() => {
                deleteMutation.mutate(row.id)
              }}
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
              title="Delete Project"
              bodyFirstLine="Are you sure you want to delete this project?"
              bodySecondLine="Project cannot be recovered"
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
    [deleteMutation, iconEditHoveColor],
  )

  return (
    <Box bg={secBgColor} style={{ minHeight: "calc(100vh - 111px)" }}>
      {selectedRow && openUpdateModal && (
        <ProjectFormUpdate
          data={selectedRow}
          isOpen={openUpdateModal}
          setIsOpen={setOpenUpdateModal}
        />
      )}
      <HStack justify="flex-end" mb={4} alignItems={"flex-end"} gap={4}>
        <HStack
          mr="auto"
          css={{ "& button": { margin: 0, height: MaxHeight } }}
        >
          <ProjectFormCreate />
        </HStack>

        <HStack
          gap={4}
          flexWrap="wrap"
          alignItems="stretch"
          direction={{ base: "column", md: "row" }}
          justify={"flex-end"}
          css={{
            "& > *": {
              flex: "1 1 auto",
            },
          }}
        >
          <InputGroup
            startElement={<IoIosSearch size={20} color={searchColor} />}
          >
            <Input
              maxWidth={"350px"}
              minWidth={"260px"}
              rounded={"full"}
              border="1px solid"
              borderColor={borderColor}
              outline={"none"}
              maxHeight={MaxHeight}
              placeholder="Search by Account, Project, PM..."
              truncate
              _focus={{ borderColor: "blue.500" }}
              value={searchProject}
              onChange={handleSearchChange}
            />
          </InputGroup>

          <SelectRoot
            collection={listStatus}
            onValueChange={(e) => setStatusProject(e.value[0])}
            size="sm"
            w="140px"
            borderRadius="md"
            position={"relative"}
            css={{
              "& .chakra-select__trigger": {
                border: "1px solid",
                borderColor: borderColor,
                height: MaxHeight,
                borderRadius: "md",
              },
            }}
          >
            <SelectTrigger clearable w={140}>
              <SelectValueText placeholder="Select status" />
            </SelectTrigger>
            <SelectContent
              position={"absolute"}
              top={"120%"}
              left={"0"}
              right={0}
              w={140}
            >
              {listStatus.items.map((movie) => (
                <SelectItem item={movie} key={movie.value}>
                  {movie.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </HStack>

        <HStack
          alignItems={"flex-end"}
          flexWrap="wrap"
          direction={{ base: "column", md: "row" }}
          css={{
            "& input": {
              maxW: "180px",
              height: MaxHeight,
              borderRadius: "md",
              borderColor: borderColor,
              size: "sm",
              p: 2,
            },
            "& button": {
              borderRadius: "md",
              height: MaxHeight,
              color: "black",
            },
          }}
        >
          <HStack>
            <VStack display="flex" gap={1}>
              <Field label="Start Date">
                <Input
                  type="date"
                  value={startDate ?? ""}
                  max={endDate ?? ""}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>
            </VStack>
            <VStack display="flex" gap={1}>
              <Field label="End Date">
                <Input
                  type="date"
                  value={endDate ?? ""}
                  min={startDate ?? ""}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>
            </VStack>
          </HStack>

          <HStack>
            <Button
              disabled={!startDate}
              backgroundColor="green.300"
              _hover={{
                backgroundColor: "green.500",
                transform: "scale(1.05)",
              }}
              _active={{
                backgroundColor: "green.600",
                transform: "scale(0.95)",
              }}
              onClick={handleFilter}
            >
              Filter
            </Button>
            <Button
              disabled={!startDate}
              backgroundColor="red.300"
              _hover={{ backgroundColor: "red.500", transform: "scale(1.05)" }}
              _active={{ backgroundColor: "red.600", transform: "scale(0.95)" }}
              onClick={handleClearFilter}
            >
              Clear
            </Button>
          </HStack>
        </HStack>
      </HStack>
      {isFetching ? (
        <VStack colorPalette="blue">
          <Spinner color="colorPalette.700" />
          <Box color="colorPalette.700">Loading...</Box>
        </VStack>
      ) : (
        <BaseTable
          columns={table_header}
          data={projects}
          tableState={tableState}
          renderRowActions={renderRowActions}
          onTableStateChange={handleTableStateChange}
          count={totalCount}
          customStyles={customStyles}
          customRows={customRows}
          importantItems={importantList}
          onToggleImportantItem={handleImportantItem}
          maxHBaseTable="436px"
        />
      )}
      <Box mt={4}>
        <Pagination
          count={totalCount}
          currentPage={(tableState.page_index ?? 0) + 1}
          onPageChange={onPageChange}
          pageSize={tableState.page_size ?? 0}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </Box>
  )
}

function ProjectManagement() {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const navigate = useNavigate()

  return (
    <Container maxW="full" bg={secBgColor} h={"fit-content"}>
      <BreadcrumbRoot mt={4} size="lg">
        <BreadcrumbLink cursor="pointer" onClick={() => navigate({ to: "/" })}>
          CMS
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Project Management</BreadcrumbCurrentLink>
      </BreadcrumbRoot>

      <ProjectManagementTable />
    </Container>
  )
}
