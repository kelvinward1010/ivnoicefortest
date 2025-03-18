import { AccountsService } from "@/client"
import AccountInfo from "@/components/accounts/accountDetails/AccountInfor"
import OverdueInvoices from "@/components/accounts/accountDetails/OverdueInvoices"
import ProjectsOverview from "@/components/accounts/accountDetails/ProjectsOverview"
import UploadDocuments from "@/components/accounts/accountDetails/UploadDocuments"
import { useColorModeValue } from "@/components/ui/color-mode"
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
import { useTranslation } from "react-i18next"

interface AccountManagementDetailProps {
  accountId: string
}

const AccountManagementDetail: React.FC<AccountManagementDetailProps> = ({
  accountId,
}) => {
  const { t } = useTranslation()
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const accountDetailError = useColorModeValue("gray.500", "gray.500")
  const columnDirection = useBreakpointValue({ base: "column", md: "row" })

  const { data: accountDetail, isLoading } = useQuery({
    queryKey: ["accountDetail", accountId],
    queryFn: async () => {
      if (!accountId) return null
      return AccountsService.getAccountById({ id: accountId })
    },
    enabled: !!accountId,
  })

  if (isLoading) {
    return (
      <VStack colorPalette="blue">
        <Spinner color="colorPalette.700" />
        <Box color="colorPalette.700">Loading...</Box>
      </VStack>
    )
  }

  if (!accountDetail) {
    return (
      <Center mt="20px">
        <Text fontSize="lg" color={accountDetailError} textAlign="center">
          {t("components.accounts.accounDetails.account_error_data_detail")}
        </Text>
      </Center>
    )
  }

  return (
    <Flex
      direction={columnDirection}
      bg={secBgColor}
      justifyContent={"space-between"}
      wrap={"wrap"}
      gap={10}
    >
      <Stack flex="1.5">
        <AccountInfo accountDetail={accountDetail} />
      </Stack>
      <Stack flex="2.5" gap={2} shadow="md" p={6} borderRadius="lg">
        <UploadDocuments accountId={accountId} />
        <ProjectsOverview />
        <OverdueInvoices />
      </Stack>
    </Flex>
  )
}

export default AccountManagementDetail
