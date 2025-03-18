import { useRef, useState } from "react"
import { FiEdit } from "react-icons/fi"
import { IoIosAdd, IoMdClose } from "react-icons/io"
import { MdOutlineDelete } from "react-icons/md"

import AlertModal from "@/components/common/AlertModal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Field } from "@/components/ui/field"
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input"
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { Flex, Input, Table, Textarea } from "@chakra-ui/react"

import { cssScrollBar, resourcePosition } from "@/constants/sow"

interface ResourceFormData {
  id: string
  resource: string
  price: string
  totalManDay: string
  totalAmount: string
  note: string
}

interface AddResourceProps {
  onTotalValuesChange: (totalValues: {
    totalManDay: number
    totalAmount: number
  }) => void
}

const AddResource = ({ onTotalValuesChange }: AddResourceProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editingIndex, setEditingIndex] = useState<number>(-1)
  const [resourcePrice, setResourcePrice] = useState<string>("1")
  const [resourceManDay, setResourceManDay] = useState<string>("1")
  const [resourceTotalAmount, setResourceTotalAmount] = useState<string>("1")
  const [resourceNote, setResourceNote] = useState<string>("")
  const [resourceSelected, setResourceSelected] = useState<string>(
    resourcePosition.items[0].value,
  )
  const [tableData, setTableData] = useState<ResourceFormData[]>([])
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  const handleResourcePriceChange = (details: { value: string }) => {
    const priceValue = Number.parseFloat(details.value) || 0
    const manDayValue = Number.parseFloat(resourceManDay) || 0
    setResourcePrice(priceValue.toString())
    setResourceTotalAmount((priceValue * manDayValue).toFixed(2))
  }

  const handleResourceManDayChange = (details: { value: string }) => {
    const manDayValue = Number.parseFloat(details.value) || 0
    const priceValue = Number.parseFloat(resourcePrice) || 0
    setResourceManDay(manDayValue.toString())
    setResourceTotalAmount((priceValue * manDayValue).toFixed(2))
  }

  const handleSelectResource = (details: { value: string[] }) => {
    setResourceSelected(details.value[0])
  }

  const resetForm = () => {
    setResourcePrice("1")
    setResourceManDay("1")
    setResourceTotalAmount("1")
    setResourceNote("")
    setResourceSelected(resourcePosition.items[0].value)
    setIsEditing(false)
    setEditingIndex(-1)
  }

  const handleCloseDialog = () => {
    resetForm()
    setOpen(false)
  }

  const totalValues = tableData.reduce(
    (acc, item) => {
      acc.price += Number.parseFloat(item.price)
      acc.manDay += Number.parseFloat(item.totalManDay)
      acc.totalAmount += Number.parseFloat(item.totalAmount)
      return acc
    },
    {
      price: 0,
      manDay: 0,
      totalAmount: 0,
    },
  )

  const updateTotalValues = (updatedData: ResourceFormData[]) => {
    const totalValues = updatedData.reduce(
      (acc, item) => {
        acc.totalManDay += Number.parseFloat(item.totalManDay)
        acc.totalAmount += Number.parseFloat(item.totalAmount)
        return acc
      },
      { totalManDay: 0, totalAmount: 0 },
    )
    onTotalValuesChange(totalValues)
  }

  const handleEdit = (index: number) => {
    const resourceToEdit = tableData[index]
    setResourceSelected(resourceToEdit.resource)
    setResourcePrice(resourceToEdit.price)
    setResourceManDay(resourceToEdit.totalManDay)
    setResourceTotalAmount(resourceToEdit.totalAmount)
    setResourceNote(resourceToEdit.note)
    setIsEditing(true)
    setEditingIndex(index)
    setOpen(true)
  }

  const handleDelete = (index: number) => {
    setItemToDelete(index)
  }

  const handleDeleteSelected = () => {
    setTableData((prevData) =>
      prevData.filter((item) => !selection.includes(item.id)),
    )
    setSelection([])
  }

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      setTableData((prevData) =>
        prevData.filter((_, index) => index !== itemToDelete),
      )
      setItemToDelete(null)
      setOpen(false)
    }
  }

  const handleSave = () => {
    const newResource: ResourceFormData = {
      id: (tableData.length + 1).toString(),
      resource: resourceSelected,
      price: resourcePrice,
      totalManDay: resourceManDay,
      totalAmount: resourceTotalAmount,
      note: resourceNote,
    }
    let updatedData: ResourceFormData[]
    if (isEditing) {
      updatedData = [...tableData]
      updatedData[editingIndex] = newResource
    } else {
      updatedData = [...tableData, newResource]
    }
    setTableData(updatedData)
    updateTotalValues(updatedData)
    resetForm()
    setOpen(false)
  }

  const [selection, setSelection] = useState<string[]>([])
  const hasSelection = selection.length > 0
  const indeterminate = hasSelection && selection.length < tableData.length

  const rows = tableData.map((item, index) => (
    <Table.Row
      key={item.id}
      data-selected={selection.includes(item.id) ? "" : undefined}
    >
      <Table.Cell>
        <Checkbox
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          aria-label="Select row"
          checked={selection.includes(item.id)}
          onCheckedChange={(changes) => {
            setSelection((prev) =>
              changes.checked
                ? [...prev, item.id]
                : selection.filter((id) => id !== item.id),
            )
          }}
        />
      </Table.Cell>
      <Table.Cell>{index + 1}</Table.Cell>
      <Table.Cell>{item.resource}</Table.Cell>
      <Table.Cell>{item.price}</Table.Cell>
      <Table.Cell>{item.totalManDay}</Table.Cell>
      <Table.Cell>{item.totalAmount}</Table.Cell>
      <Table.Cell>{item.note}</Table.Cell>
      <Table.Cell>
        <Flex gap={2} justifyContent={"flex-end"} alignItems={"center"}>
          <Button
            size={"xs"}
            colorPalette={"blue"}
            disabled={!!selection.includes(item.id)}
          >
            <FiEdit
              size={"20px"}
              cursor={"pointer"}
              style={{
                float: "right",
                color: "white",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
              onClick={() => handleEdit(index)}
            />
          </Button>
          <DialogRoot>
            <DialogTrigger asChild>
              <Button
                size={"xs"}
                colorPalette={"red"}
                disabled={!!selection.includes(item.id)}
                onClick={() => handleDelete(index)}
              >
                <MdOutlineDelete
                  size={"24px"}
                  cursor={"pointer"}
                  style={{
                    float: "right",
                    color: "white",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.2)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle color={"red"}>
                  Are you sure you want to delete?
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p>Data will be lost permanently.</p>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <Button colorPalette={"blue"} onClick={confirmDelete}>
                  Agree
                </Button>
              </DialogFooter>
              <DialogCloseTrigger />
            </DialogContent>
          </DialogRoot>
        </Flex>
      </Table.Cell>
    </Table.Row>
  ))

  return (
    <Flex
      gap={6}
      direction={"column"}
      justifyContent={"space-between"}
      w={"full"}
    >
      {selection.length > 0 && (
        <Flex justifyContent="flex-end" w="full" mb={2}>
          <DialogRoot>
            <DialogTrigger asChild>
              <Button
                colorPalette="red"
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <MdOutlineDelete
                  size={"24px"}
                  cursor={"pointer"}
                  style={{
                    float: "right",
                    color: "white",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.2)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                />
                ({selection.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle color={"red"}>Delete Confirmation</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p>
                  Are you sure you want to delete {selection.length} selected
                  items?
                </p>
                <p>This action cannot be undone.</p>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <Button colorPalette="red" onClick={handleDeleteSelected}>
                  Delete
                </Button>
              </DialogFooter>
              <DialogCloseTrigger />
            </DialogContent>
          </DialogRoot>
        </Flex>
      )}
      <Table.ScrollArea
        maxH={"30vh"}
        rounded={"sm"}
        borderWidth="1px"
        css={cssScrollBar}
      >
        <Table.Root
          size={"md"}
          variant={"outline"}
          showColumnBorder
          stickyHeader
          interactive
        >
          <Table.Header w={"100%"}>
            <Table.Row>
              <Table.ColumnHeader w={"4%"}>
                <Checkbox
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  aria-label="Select all rows"
                  checked={
                    indeterminate ? "indeterminate" : selection.length > 0
                  }
                  onCheckedChange={(changes) => {
                    setSelection(
                      changes.checked ? tableData.map((item) => item.id) : [],
                    )
                  }}
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader w={"4%"}>No</Table.ColumnHeader>
              <Table.ColumnHeader w={"20%"}>Resources</Table.ColumnHeader>
              <Table.ColumnHeader w={"8%"}>Unit Price</Table.ColumnHeader>
              <Table.ColumnHeader w={"8%"}>Man Day</Table.ColumnHeader>
              <Table.ColumnHeader w={"8%"}>Total Amount</Table.ColumnHeader>
              <Table.ColumnHeader w={"40%"}>Notes</Table.ColumnHeader>
              <Table.ColumnHeader w={"8%"} textAlign={"end"}>
                Actions
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>{rows}</Table.Body>
          {tableData.length > 0 && (
            <Table.Footer>
              <Table.Row fontWeight="bold">
                <Table.Cell />
                <Table.Cell />
                <Table.Cell>Total</Table.Cell>
                <Table.Cell>{totalValues.price.toFixed(2)}</Table.Cell>
                <Table.Cell>{totalValues.manDay.toFixed(2)}</Table.Cell>
                <Table.Cell>{totalValues.totalAmount.toFixed(2)}</Table.Cell>
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
            </Table.Footer>
          )}
        </Table.Root>
      </Table.ScrollArea>
      <DialogRoot
        size={"lg"}
        placement={"center"}
        motionPreset={"scale"}
        closeOnEscape={false}
        closeOnInteractOutside={false}
        open={open}
        onOpenChange={(isOpen) => setOpen(isOpen.open)}
      >
        <DialogTrigger asChild>
          <Button size={"md"} colorPalette={"blue"}>
            <IoIosAdd /> Add Resource
          </Button>
        </DialogTrigger>
        <DialogContent ref={contentRef}>
          <DialogHeader
            fontWeight={"bold"}
            fontSize={"xl"}
            textAlign={"center"}
          >
            <AlertModal
              onClick={handleCloseDialog}
              triggerButton={
                <Flex position={"absolute"} right={5} top={5}>
                  <IoMdClose size={"24px"} cursor={"pointer"} />
                </Flex>
              }
              title="Are you sure you want to leave?"
              bodyFirstLine="Your action is not completed"
              bodySecondLine="Data not saved will be lost"
              buttonContent="Agree"
            />
            Resource Allocation
          </DialogHeader>
          <DialogBody paddingTop={0}>
            <Flex
              flexDirection={"column"}
              alignItems={"space-between"}
              w={"full"}
              overflowY={"auto"}
              minH={"20vh"}
              maxH={"70vh"}
              gap={4}
            >
              <Field label="Resource">
                <SelectRoot
                  collection={resourcePosition}
                  height={"40px"}
                  width="full"
                  defaultValue={[resourcePosition.items[0].value]}
                  value={[resourceSelected]}
                  onValueChange={handleSelectResource}
                >
                  <SelectTrigger>
                    <SelectValueText />
                  </SelectTrigger>
                  <SelectContent portalRef={contentRef}>
                    {resourcePosition.items.map((type) => (
                      <SelectItem item={type} key={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Field>
              <Flex
                gap={8}
                justifyContent={"space-between"}
                alignItems={"center"}
                w={"full"}
              >
                <Field label="Unit Price">
                  <NumberInputRoot
                    value={resourcePrice}
                    min={1}
                    w={"full"}
                    allowMouseWheel={true}
                    onValueChange={handleResourcePriceChange}
                  >
                    <NumberInputField />
                  </NumberInputRoot>
                </Field>
                <div style={{ marginTop: "24px" }}>x</div>
                <Field label="Total Man Day">
                  <NumberInputRoot
                    value={resourceManDay}
                    min={1}
                    w={"full"}
                    allowMouseWheel={true}
                    onValueChange={handleResourceManDayChange}
                  >
                    <NumberInputField />
                  </NumberInputRoot>
                </Field>
                <div style={{ marginTop: "24px" }}>=</div>
                <Field label="Total Amount">
                  <Input
                    color={"fg"}
                    bgColor={"bg.emphasized"}
                    disabled
                    value={resourceTotalAmount}
                    readOnly
                    width="full"
                  />
                </Field>
              </Flex>
              <Field label="Notes">
                <Textarea
                  value={resourceNote}
                  onChange={(e) => setResourceNote(e.target.value)}
                  paddingLeft={3}
                  fontSize={"14px"}
                  size="lg"
                  placeholder="Notes"
                />
              </Field>
            </Flex>
            <DialogFooter
              paddingTop={"24px"}
              paddingRight={0}
              paddingBottom={0}
            >
              <DialogActionTrigger asChild>
                <Button colorPalette={"blue"} onClick={handleSave}>
                  Save
                </Button>
              </DialogActionTrigger>
            </DialogFooter>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Flex>
  )
}

export default AddResource
