import { Box, Container, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import InvoiceIndexCaculate from "@/components/invoices/caculate_invoice"
import { useColorModeValue } from "@/components/ui/color-mode"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const bgColor = useColorModeValue("ui.secondary", "ui.dark")
  return (
    <>
      <Container maxW="full" bgColor={bgColor}>
        <Box p={4} m={4}>
          <Text fontSize="2xl">Hi BlueOC 👋🏼</Text>
          <Text>Welcome back, nice to see you again!</Text>
          <InvoiceIndexCaculate />
        </Box>
      </Container>
    </>
  )
}
