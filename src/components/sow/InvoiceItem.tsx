import { Button } from "@/components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Box, Flex, Input } from "@chakra-ui/react"
import { useState } from "react"
import { FiEdit } from "react-icons/fi"
import { MdOutlineDelete } from "react-icons/md"

interface InvoiceItemProps {
  issue: { label: string; value: string }
  index: number
  onDelete: (index: number) => void
  onEdit: (index: number, newValue: string) => void
}

const InvoiceItem = ({ issue, index, onDelete, onEdit }: InvoiceItemProps) => {
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [editingInvoiceIndex, setEditingInvoiceIndex] = useState<number | null>(
    null,
  )
  const [editingInvoiceDate, setEditingInvoiceDate] = useState<string>("")

  const handleEditInvoiceDate = (index: number, value: string) => {
    setEditingInvoiceIndex(index)
    setEditingInvoiceDate(value)
  }

  const handleDeleteInvoiceDate = (index: number) => {
    setItemToDelete(index)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setEditingInvoiceDate(newDate)

    if (editingInvoiceIndex !== null && newDate) {
      onEdit(editingInvoiceIndex, newDate)
    }
  }

  const finishEditing = () => {
    setEditingInvoiceIndex(null)
  }

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      onDelete(itemToDelete)
      setItemToDelete(null)
    }
  }

  return (
    <Box
      minH={"50px"}
      key={issue.label}
      color={"black"}
      padding={4}
      rounded={"sm"}
      w={"full"}
      background={"gray.100"}
      position={"relative"}
    >
      <Flex
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        {editingInvoiceIndex === index ? (
          <Input
            type="date"
            h={"50px"}
            w={"full"}
            position={"absolute"}
            background={"gray.100"}
            bottom={0}
            right={0}
            value={editingInvoiceDate}
            onChange={handleDateChange}
            onBlur={finishEditing}
          />
        ) : (
          <>
            {issue.label} {issue.value}{" "}
            <Flex
              gap={2}
              justifyContent={"space-between"}
              alignItems={"center"}
              mt={"-4px"}
            >
              <FiEdit
                size={"22px"}
                style={{
                  marginRight: "3px",
                  color: "blue",
                  transition: "transform 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"
                }}
                cursor={"pointer"}
                onClick={() => handleEditInvoiceDate(index, issue.value)}
              />
              <DialogRoot>
                <DialogTrigger asChild>
                  <MdOutlineDelete
                    size={"24px"}
                    cursor={"pointer"}
                    style={{
                      float: "right",
                      color: "red",
                      transition: "transform 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)"
                    }}
                    onClick={() => handleDeleteInvoiceDate(index)}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle color={"red"}>
                      Are you sure you want to delete this invoice?
                    </DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <p>Data will be deleted permanently.</p>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogActionTrigger>
                    <DialogActionTrigger asChild>
                      <Button colorPalette={"blue"} onClick={confirmDelete}>
                        Agree
                      </Button>
                    </DialogActionTrigger>
                  </DialogFooter>
                  <DialogCloseTrigger />
                </DialogContent>
              </DialogRoot>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  )
}

export default InvoiceItem
