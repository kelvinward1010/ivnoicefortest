import { ProjectsService } from "@/client"
import { useColorModeValue } from "@/components/ui/color-mode"
import { formatDate } from "@/utils"
import {
  Box,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import type React from "react"
import ProjectInfo from "./ProjectInfo"
import ProjectInvoices from "./ProjectInvoice"
import ProjectSOW from "./ProjectSOW"

interface ProjectManagementDetailProps {
  projectId: string
}

const ProjectManagementDetail: React.FC<ProjectManagementDetailProps> = ({
  projectId,
}) => {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const projectDetailError = useColorModeValue("gray.500", "gray.500")
  const columnDirection = useBreakpointValue({ base: "column", md: "row" })

  const { data: projectDetail, isLoading } = useQuery({
    queryKey: ["projectDetail", projectId],
    queryFn: async () => {
      if (!projectId) return null

      const dataDetail = await ProjectsService.getProjectById({ projectId })

      if (!dataDetail) return null

      return {
        ...dataDetail,
        start_date: dataDetail.start_date
          ? formatDate(dataDetail.start_date)
          : null,
        end_date: dataDetail.end_date ? formatDate(dataDetail.end_date) : null,
      }
    },
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <VStack colorPalette="blue">
        <Spinner color="colorPalette.700" />
        <Box color="colorPalette.700">Loading...</Box>
      </VStack>
    )
  }

  if (!projectDetail) {
    return (
      <Center mt="20px">
        <Text fontSize="lg" color={projectDetailError} textAlign="center">
          No project details available.
        </Text>
      </Center>
    )
  }

  return (
    <Flex direction={columnDirection} gap={10} bg={secBgColor}>
      <Stack flex="1">
        <ProjectInfo projectDetail={projectDetail} />
      </Stack>
      <Stack flex="2" gap={2} shadow="md" p={6} borderRadius="lg">
        <ProjectSOW projectDetail={projectDetail} />
        <ProjectInvoices />
      </Stack>
    </Flex>
  )
}

export default ProjectManagementDetail
