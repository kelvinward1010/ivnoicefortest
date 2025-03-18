import { Heading, Stack, Table } from "@chakra-ui/react"

const ResourceList = () => {
  return (
    <Stack
      w={"full"}
      h={"100%"}
      p={4}
      gap={4}
      rounded="md"
      border="none"
      shadow="md"
    >
      <Heading fontWeight="semibold" fontSize="16px" lineHeight="1.25rem">
        Resource Allocations
      </Heading>
      <Table.Root
        rounded="md"
        variant="outline"
        showColumnBorder
        stickyHeader
        interactive
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>No</Table.ColumnHeader>
            <Table.ColumnHeader>Resource</Table.ColumnHeader>
            <Table.ColumnHeader>Unit Price</Table.ColumnHeader>
            <Table.ColumnHeader>Total Manday</Table.ColumnHeader>
            <Table.ColumnHeader>Total Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Notes</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
      </Table.Root>
    </Stack>
  )
}

export default ResourceList
