import { useColorModeValue } from "@/components/ui/color-mode"
import { Input } from "@chakra-ui/react"
import type React from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import type { FieldInput, uiState } from "."
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
import { Field } from "../../ui/field"

interface ModalRenameProps {
  renameId: string
  handleRename: () => void
  updateUiState: (key: keyof uiState, value: any) => void
  register: UseFormRegister<FieldInput>
  errors: FieldErrors<FieldInput>
  isPending: boolean
}

const ModalRename: React.FC<ModalRenameProps> = ({
  handleRename,
  updateUiState,
  renameId,
  register,
  errors,
  isPending,
}) => {
  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const buttontextColor = useColorModeValue("gray.100", "white")

  return (
    <DialogRoot
      size="md"
      placement="center"
      motionPreset="slide-in-bottom"
      open={Boolean(renameId)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogCloseTrigger onClick={() => updateUiState("renameId", null)} />
        </DialogHeader>
        <DialogBody>
          <Field
            label="New folder name"
            invalid={!!errors?.reName}
            errorText={errors?.reName?.message}
          >
            <Input
              {...register("reName", {
                required: "New folder name is required",
                minLength: {
                  value: 3,
                  message: "New folder name must be at least 3 characters",
                },
              })}
              placeholder="Enter new folder name"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button onClick={() => updateUiState("renameId", null)}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            bg={buttonColor}
            color={buttontextColor}
            variant={"subtle"}
            onClick={handleRename}
            loading={isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default ModalRename
