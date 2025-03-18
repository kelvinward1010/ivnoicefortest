import BaseTable, { type HeaderTable } from "@/components/common/BaseTable"
import { Box, Heading, Stack } from "@chakra-ui/react"
import type { CSSProperties } from "react"
import { useTranslation } from "react-i18next"

const OverdueInvoices = () => {
  const { t } = useTranslation()

  const columns: HeaderTable[] = [
    {
      name: t("components.accounts.accountDetails.OverdueInvoices.name"),
      key: "name",
    },
    {
      name: t("components.accounts.accountDetails.OverdueInvoices.invoice"),
      key: "invoice",
    },
  ]

  const customStyles: { [key: string]: CSSProperties } = {
    name: { width: "20%" },
    invoice: { width: "70%" },
  }

  return (
    <Box flex="1">
      <Stack>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} mb={5}>
          {t("components.accounts.accountDetails.OverdueInvoices.title")}
        </Heading>
      </Stack>
      <Box maxHeight="300px" overflowY="auto">
        <BaseTable columns={columns} customStyles={customStyles} />
      </Box>
    </Box>
  )
}

export default OverdueInvoices
