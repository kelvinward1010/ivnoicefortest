import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { colorIconFolder } from "@/constants/drive"
import {
  Button,
  DialogActionTrigger,
  DialogFooter,
  Flex,
  Input,
} from "@chakra-ui/react"
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FaFolderPlus } from "react-icons/fa"
import type { FieldInput } from "."
import { Field } from "../../ui/field"

interface ModalCreateFolderProps {
  handleCreateFolder: (data: FieldInput) => void
  modalRef: React.RefObject<HTMLDivElement>
  handleActionModal: () => void
  isModalOpen: boolean
  register: UseFormRegister<FieldInput>
  errors: FieldErrors<FieldInput>
  handleSubmit: UseFormHandleSubmit<FieldInput>
  isPending: boolean
}

function ModalCreateFolder({
  handleCreateFolder,
  modalRef,
  handleActionModal,
  isModalOpen,
  register,
  errors,
  handleSubmit,
  isPending,
}: ModalCreateFolderProps) {
  const { t } = useTranslation()
  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const buttontextColor = useColorModeValue("gray.100", "white")

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <DialogRoot
      size="md"
      placement="center"
      motionPreset="slide-in-bottom"
      open={isModalOpen}
    >
      <DialogTrigger asChild>
        <Button
          onClick={handleActionModal}
          w={"135px"}
          display={"flex"}
          justifyContent={"start"}
          alignItems={"center"}
          variant="outline"
          size="sm"
          border={"1px solid #ccc"}
          gap={2}
        >
          <FaFolderPlus color={colorIconFolder} size={15} />
          {t("components.driver.actions.create_folder")}
        </Button>
      </DialogTrigger>
      <DialogContent ref={modalRef} onClick={handleModalClick}>
        <DialogHeader>
          <DialogTitle>
            <Flex align="center" gap={2}>
              <FaFolderPlus color={colorIconFolder} /> Create New Folder
            </Flex>
          </DialogTitle>
          <DialogCloseTrigger onClick={handleActionModal} />
        </DialogHeader>
        <DialogBody>
          <Field
            label="Folder Name"
            invalid={!!errors?.folderName}
            errorText={errors?.folderName?.message}
          >
            <Input
              {...register("folderName", {
                required: "Folder name is required",
                minLength: {
                  value: 3,
                  message: "Folder name must be at least 3 characters",
                },
              })}
              placeholder="Enter folder name"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button onClick={handleActionModal}>Cancel</Button>
          </DialogActionTrigger>
          <Button
            bg={buttonColor}
            color={buttontextColor}
            variant={"subtle"}
            onClick={handleSubmit((data) => {
              handleCreateFolder(data)
              handleActionModal()
            })}
            loading={isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default ModalCreateFolder
