import { Box, Flex } from "@chakra-ui/react"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"

import InvoiceIssueScheduleList from "@/components/invoice_issue_schedule/InvoiceIssueScheduleList"
import ResourceList from "@/components/resource_allocattions/ResourceList"
import SowDetails from "@/components/sow/SowDetails"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { useColorModeValue } from "@/components/ui/color-mode"

export const Route = createFileRoute(
  "/_layout/projects/$projectId/sows/$sowId",
)({
  component: SowDetailLayout,
})

function SowDetailLayout() {
  const navigate = useNavigate()
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const { projectId, sowId } = useParams({ strict: false }) as {
    projectId: string
    sowId: string
  }

  return (
    <Box
      bg={secBgColor}
      width={"full"}
      display={"flex"}
      flexDirection={"column"}
      gap={4}
    >
      <Flex alignItems="center" mt={4}>
        <BreadcrumbRoot ml={6} size="lg">
          <BreadcrumbLink
            cursor="pointer"
            onClick={() => navigate({ to: "/projects" })}
          >
            Project Management
          </BreadcrumbLink>
          <BreadcrumbLink
            cursor="pointer"
            onClick={() => navigate({ to: `/projects/${projectId}` })}
          >
            Project Detail
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>SOW Detail</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <Flex
        w={"full"}
        justifyContent={"space-around"}
        alignItems={"stretch"}
        flex={1}
        p={6}
        pt={0}
        gap={6}
      >
        <Flex flex={1} height="100%" minW="0">
          <SowDetails projectId={projectId} sowId={sowId} />
        </Flex>
        <Flex
          w={"100%"}
          flex={2}
          gap={6}
          direction={"column"}
          height="100%"
          minW="0"
        >
          <Flex flex="2">
            <InvoiceIssueScheduleList sowId={sowId} />
          </Flex>
          <Flex flex="8">
            <ResourceList />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

export default SowDetailLayout
