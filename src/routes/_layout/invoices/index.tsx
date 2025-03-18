import { Container } from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { InvoiceManagementTable } from "@/components/invoices/table"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { useColorModeValue } from "@/components/ui/color-mode"

export const Route = createFileRoute("/_layout/invoices/")({
  component: Invoices,
})

function Invoices() {
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const navigate = useNavigate()
  return (
    <Container maxW="full" bgColor={secBgColor}>
      <BreadcrumbRoot mt={4} size="lg">
        <BreadcrumbLink cursor="pointer" onClick={() => navigate({ to: "/" })}>
          CMS
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Invoice Management</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <InvoiceManagementTable />
    </Container>
  )
}
