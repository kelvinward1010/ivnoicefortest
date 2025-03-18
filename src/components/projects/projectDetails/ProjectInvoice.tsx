import BaseTable, { type HeaderTable } from "@/components/common/BaseTable"
import { Box, Heading, Stack } from "@chakra-ui/react"
import type { CSSProperties } from "react"

const ProjectInvoices = () => {
  const columns: HeaderTable[] = [
    {
      name: "Invoice Name",
      key: "invoice_name",
    },
    {
      name: "Issue Date",
      key: "issue_date",
    },
    {
      name: "Due Date",
      key: "due_date",
    },
    {
      name: "Status",
      key: "status",
    },
  ]

  const customStyles: { [key: string]: CSSProperties } = {
    invoice_name: { width: "50%" },
    issue_date: { width: "10%" },
    due_date: { width: "10%" },
    status: { width: "30%" },
  }

  return (
    <Box flex="1">
      <Stack>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} mb={5}>
          {"III. Project Invoices"}
        </Heading>
      </Stack>
      <BaseTable columns={columns} customStyles={customStyles} />
    </Box>
  )
}

export default ProjectInvoices
