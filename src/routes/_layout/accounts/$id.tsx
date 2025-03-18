import AccountManagementDetail from "@/components/accounts/accountDetails"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Box, Flex } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { useParams } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/accounts/$id")({
  parseParams: (params: Record<string, any>) => ({ id: params.id }),
  component: AccountDetailLayout,
})

function AccountDetailLayout() {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  return (
    <Box bg={secBgColor} width={"full"}>
      <Flex alignItems="center" my={4}>
        <BreadcrumbRoot ml={5} size="lg">
          <BreadcrumbLink
            cursor="pointer"
            onClick={() => navigate({ to: "/" })}
          >
            CMS
          </BreadcrumbLink>
          <BreadcrumbLink
            cursor="pointer"
            onClick={() => navigate({ to: "/accounts" })}
          >
            Account Management
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Account Details</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <AccountManagementDetail accountId={id} />
    </Box>
  )
}

export default AccountDetailLayout
