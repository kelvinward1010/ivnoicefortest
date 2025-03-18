import BaseTable, { type HeaderTable } from "@/components/common/BaseTable"
import { Box, Heading, Stack } from "@chakra-ui/react"
import type { CSSProperties } from "react"
import { useTranslation } from "react-i18next"

const ProjectsOverview = () => {
  const { t } = useTranslation()

  const columns: HeaderTable[] = [
    {
      name: t("components.accounts.accountDetails.ProjectOverview.name"),
      key: "name",
    },
    {
      name: t("components.accounts.accountDetails.ProjectOverview.status"),
      key: "status",
    },
    {
      name: t("components.accounts.accountDetails.ProjectOverview.detail"),
      key: "detail",
    },
  ]

  const customStyles: { [key: string]: CSSProperties } = {
    name: { width: "30%" },
    status: { width: "30%" },
    detail: { width: "60%" },
  }

  return (
    <Box flex="1">
      <Stack>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} mb={5}>
          {t("components.accounts.accountDetails.ProjectOverview.title")}
        </Heading>
      </Stack>
      <Box maxHeight="300px" overflowY="auto">
        <BaseTable columns={columns} customStyles={customStyles} />
      </Box>
    </Box>
  )
}

export default ProjectsOverview
