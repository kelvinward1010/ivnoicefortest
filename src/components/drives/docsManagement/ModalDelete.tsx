import { Text } from "@chakra-ui/react"
import type { uiState } from "."
import { Button } from "../../ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../../ui/dialog"

interface ModalDeleteProps {
  deleteConfirm: string | null
  updateUiState: (key: keyof uiState, value: any) => void
  handleDelete: (fileId: string) => void
  isPending: boolean
}

function ModalDelete({
  deleteConfirm,
  updateUiState,
  handleDelete,
  isPending,
}: ModalDeleteProps) {
  const handleCancel = () => updateUiState("deleteConfirm", null)
  return (
    <DialogRoot
      size="md"
      placement="center"
      motionPreset="slide-in-bottom"
      open={Boolean(deleteConfirm)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle
            color={"red"}
            alignItems={"center"}
            gap={3}
            display={"flex"}
          >
            Delete
          </DialogTitle>
          <DialogCloseTrigger onClick={handleCancel} />
        </DialogHeader>
        <DialogBody>
          <Text>Are you sure you want to delete?</Text>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button onClick={handleCancel}>Cancel</Button>
          </DialogActionTrigger>
          <Button
            loading={isPending}
            bg={"red"}
            color={"ui.light"}
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default ModalDelete
