import { Box } from "@chakra-ui/react"
import React, { useEffect, useRef } from "react"
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form"
import type { FieldInput } from "."
import InputUpload from "./InputUpload"
import ModalCreateFolder from "./ModalCreateFolder"

interface ConTextMenuProps {
  handleCreateFolder: (data: FieldInput) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>
  contextMenu: { x: number; y: number } | null
  setContextMenu: (value: { x: number; y: number } | null) => void
  bgColor: string
  modalRef: React.RefObject<HTMLDivElement>
  handleActionModal: () => void
  isModalOpen: boolean
  register: UseFormRegister<FieldInput>
  errors: FieldErrors<FieldInput>
  handleSubmit: UseFormHandleSubmit<FieldInput>
  isPendingCreate: boolean
  selectedFile: File | null
}

function ConTextMenu({
  handleCreateFolder,
  handleFileChange,
  fileInputRef,
  contextMenu,
  setContextMenu,
  bgColor,
  modalRef,
  handleActionModal,
  isModalOpen,
  register,
  errors,
  handleSubmit,
  isPendingCreate,
  selectedFile,
}: ConTextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!contextMenu) return

      const target = event.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !(modalRef.current?.contains(target) && isModalOpen)
      ) {
        setContextMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [contextMenu, isModalOpen, modalRef, setContextMenu])

  useEffect(() => {
    if (isModalOpen) {
      setContextMenu(null)
    }
  }, [isModalOpen, setContextMenu])

  if (!contextMenu) return null

  return (
    <Box
      ref={menuRef}
      position="fixed"
      left={`${contextMenu.x}px`}
      top={`${contextMenu.y}px`}
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={2}
      zIndex={10}
      as="ul"
      listStyleType="none"
      bgColor={bgColor}
    >
      <Box
        bgColor={bgColor}
        as="li"
        p={2}
        display="flex"
        gap={1}
        alignItems="center"
        borderRadius="md"
        _hover={{ bg: "gray.200", cursor: "pointer" }}
      >
        <ModalCreateFolder
          handleCreateFolder={handleCreateFolder}
          modalRef={modalRef}
          handleActionModal={handleActionModal}
          isModalOpen={isModalOpen}
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          isPending={isPendingCreate}
        />
      </Box>
      <Box
        bgColor={bgColor}
        as="li"
        p={2}
        display="flex"
        gap={1}
        alignItems="center"
        borderRadius="md"
        _hover={{ bg: "gray.200", cursor: "pointer" }}
      >
        <InputUpload
          handleFileChange={handleFileChange}
          fileInputRef={fileInputRef}
          selectedFile={selectedFile}
        />
      </Box>
    </Box>
  )
}

export default React.memo(ConTextMenu)
