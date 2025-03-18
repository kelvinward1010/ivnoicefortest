import ProjectManagementDetail from "@/components/projects/projectDetails"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Box, Flex } from "@chakra-ui/react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/projects/$projectId/")({
  component: ProjectDetailLayout,
})

function ProjectDetailLayout() {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const { projectId } = useParams({ strict: false }) as {
    projectId: string
  }
  const navigate = useNavigate()

  return (
    <Box bg={secBgColor} width={"full"}>
      <Flex alignItems="center" my={4}>
        <BreadcrumbRoot ml={6} size="lg">
          <BreadcrumbLink
            cursor="pointer"
            onClick={() => navigate({ to: "/" })}
          >
            CMS
          </BreadcrumbLink>
          <BreadcrumbLink
            cursor="pointer"
            onClick={() => navigate({ to: "/projects" })}
          >
            Project Management
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Project Details</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <ProjectManagementDetail projectId={projectId} />
    </Box>
  )
}

export default ProjectDetailLayout
