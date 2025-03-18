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
import { appConfigs } from "@/configs/app"
import useCustomToast from "@/hooks/useCustomToast"
import {
  useCreateFolder,
  useDeleteFile,
  useDriveFolderContents,
  useRenameFile,
  useUploadFile,
} from "@/services/drives"
import type { DriveItem } from "@/types/drive"
import {
  Box,
  Container,
  Flex,
  IconButton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import type React from "react"
import { useCallback, useEffect } from "react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FiGrid, FiList } from "react-icons/fi"
import { Button } from "../../ui/button"
import BreadcrumbNavigation from "./BreadcrumbNavigation"
import ConTextMenu from "./ConTextMenu"
import FileList from "./FileList"
import FolderList from "./FolderList"
import InputUpload from "./InputUpload"
import ModalCreateFolder from "./ModalCreateFolder"
import ModalDelete from "./ModalDelete"
import ModalPreview from "./ModalPreview"
import ModalRename from "./ModalRename"

interface DriverCpntProps {
  folder_id?: string | null
  name_folder?: string | null
  projectId?: string
  accountId?: string
}

interface DriveProps {
  folder_id?: string | null
  name_folder?: string | null
  componentToUpload?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
  projectId?: string
  accountId?: string
  handleUploadSuccess?: () => void
}

export interface uiState {
  deleteConfirm: string | null
  renameId: string | null
  openMenuId: string | null
  isGridView: boolean
}

export interface FieldInput {
  folderName: string
  reName: string
}

function DriveCpnt({
  folder_id,
  name_folder,
  projectId,
  accountId,
}: DriverCpntProps) {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const bgColor = useColorModeValue("ui.secondary", "ui.dark")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uiState, setUiState] = useState<uiState>({
    deleteConfirm: null,
    renameId: null,
    openMenuId: null,
    isGridView: true,
  })
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)
  const [currentFolder, setCurrentFolder] = useState<{
    id?: string | null
    name?: string | null
  } | null>({
    id: folder_id,
    name: name_folder,
  })
  const [folderHistory, setFolderHistory] = useState<
    { id: string; name: string }[]
  >([{ id: folder_id ?? appConfigs.folderCMSId, name: name_folder ?? "Home" }])
  const { files, folders, isLoading } = useDriveFolderContents(
    currentFolder?.id || null,
  )
  const { showSuccess, showError } = useCustomToast()
  const createFolderMutation = useCreateFolder()
  const uploadFileMutation = useUploadFile()
  const deleteFileMutation = useDeleteFile()
  const renameFileMutation = useRenameFile()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldInput>({
    defaultValues: {
      folderName: "",
      reName: "",
    },
  })

  const reName = watch("reName")

  const updateUiState = useCallback((key: string, value: any) => {
    setUiState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (previewUrl || selectedFile) return
      event.preventDefault()
      setContextMenu({ x: event.clientX + 5, y: event.clientY + 5 })
    },
    [previewUrl, selectedFile],
  )

  const handleActionModal = () => {
    setIsModalOpen(!isModalOpen)
    if (isModalOpen === false) {
      reset({ folderName: "" })
    }
  }

  const handleCreateFolder = useCallback(
    async (data: FieldInput) => {
      createFolderMutation.mutate(
        {
          parentId: currentFolder?.id || appConfigs.folderCMSId,
          name: data.folderName,
        },
        {
          onSuccess: () => {
            reset({ folderName: "" })
            setIsModalOpen(false)
            showSuccess(t("components.driver.status.create_success"))
          },
          onError: (error: any) => {
            showError(
              error.message || t("components.driver.status.create_failed"),
            )
          },
        },
      )
    },
    [createFolderMutation, currentFolder?.id, reset, showSuccess, showError, t],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadFile = async () => {
    if (!selectedFile) return
    uploadFileMutation.mutate(
      {
        parentId: currentFolder?.id || appConfigs.folderCMSId,
        file: selectedFile,
        projectId: projectId,
        accountId: accountId,
      },
      {
        onSuccess: () => {
          setSelectedFile(null)
          setPreviewUrl(null)
          showSuccess(t("components.driver.status.upload_success"))
        },
        onError: (error: any) => {
          showError(
            error.message || t("components.driver.status.upload_failed"),
          )
        },
      },
    )
  }

  const handleDelete = async (fileId: string) => {
    deleteFileMutation.mutate(
      {
        fileId,
        parentId: currentFolder?.id || appConfigs.folderCMSId,
        projectId: projectId,
        accountId: accountId,
      },
      {
        onSuccess: () => {
          updateUiState("deleteConfirm", null)
          showSuccess(t("components.driver.status.delete_success"))
        },
        onError: (error: any) => {
          showError(
            error.message || t("components.driver.status.delete_failed"),
          )
        },
      },
    )
  }

  const handleRename = async () => {
    if (!uiState.renameId) return
    renameFileMutation.mutate(
      {
        fileId: uiState.renameId,
        newName: reName,
        parentId: currentFolder?.id,
        projectId: projectId,
        accountId: accountId,
      },
      {
        onSuccess: () => {
          updateUiState("renameId", "")
          reset({ reName: "" })
        },
        onError: (error: any) => {
          showError(
            error.message || t("components.driver.status.rename_failed"),
          )
        },
      },
    )
  }

  const handleFolderClick = useCallback(
    (folderId: string, folderName: string) => {
      const updatedHistory = [...folderHistory]
      const existingIndex = updatedHistory.findIndex(
        (folder) => folder.id === folderId,
      )
      if (existingIndex !== -1) {
        updatedHistory.splice(existingIndex + 1)
      } else {
        updatedHistory.push({ id: folderId, name: folderName })
      }

      setFolderHistory(updatedHistory)
      setCurrentFolder({ id: folderId, name: folderName })
    },
    [folderHistory],
  )

  useEffect(() => {
    if (folder_id) {
      const folder: { id: string; name: string } | undefined = folders.find(
        (folder: { id: string; name: string }) => folder.id === folder_id,
      )
      if (folder) {
        setCurrentFolder({ id: folder.id, name: folder.name })
        setFolderHistory([
          { id: appConfigs.folderCMSId, name: "Home" },
          { id: folder.id, name: folder.name },
        ])
      }
    }
  }, [folder_id, folders])

  return (
    <Container
      h={"fit-content"}
      pt={0}
      minH={"80vh"}
      maxW="full"
      bgColor={bgColor}
      onContextMenu={handleContextMenu}
    >
      <Box p={4} m={4}>
        {folderHistory.length > 1 && (
          <BreadcrumbNavigation
            folderHistory={folderHistory}
            setFolderHistory={setFolderHistory}
            setCurrentFolder={setCurrentFolder}
          />
        )}
        <Flex justify={"space-between"} align={"center"} mb={4} ml={2}>
          <Flex justify="start" gap={7} align="center">
            <ModalCreateFolder
              modalRef={modalRef}
              handleCreateFolder={handleCreateFolder}
              handleActionModal={handleActionModal}
              isModalOpen={isModalOpen}
              register={register}
              errors={errors || {}}
              handleSubmit={handleSubmit}
              isPending={createFolderMutation.isPending}
            />
            <InputUpload
              handleFileChange={handleFileChange}
              fileInputRef={fileInputRef}
              selectedFile={selectedFile}
            />
          </Flex>
          <IconButton
            aria-label="Toggle View"
            onClick={() => updateUiState("isGridView", !uiState.isGridView)}
            variant={"outline"}
          >
            {uiState.isGridView ? <FiList /> : <FiGrid />}
          </IconButton>
        </Flex>
        {(previewUrl || selectedFile) && (
          <ModalPreview
            selectedFile={selectedFile}
            handleUploadFile={handleUploadFile}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            setSelectedFile={setSelectedFile}
            isPending={uploadFileMutation.isPending}
          />
        )}
        {isLoading ? (
          <VStack colorPalette="teal" mt={50}>
            <Spinner color="colorPalette.600" />
            <Text color="colorPalette.600">Loading...</Text>
          </VStack>
        ) : (
          <>
            <Box
              mt={10}
              display={"flex"}
              gap={10}
              flexWrap={"wrap"}
              bgColor="gray.100"
              borderRadius="md"
            >
              <FolderList
                folders={folders as DriveItem[]}
                handleFolderClick={handleFolderClick}
                updateUiState={updateUiState}
                setValue={setValue}
                bgColor={bgColor}
                isGridView={uiState.isGridView}
                openMenuId={uiState.openMenuId}
              />
            </Box>
            <Box
              display={"flex"}
              gap={10}
              flexWrap={"wrap"}
              bgColor="gray.100"
              borderRadius="md"
            >
              <FileList
                files={files as DriveItem[]}
                updateUiState={updateUiState}
                setValue={setValue}
                bgColor={bgColor}
                isGridView={uiState.isGridView}
                openMenuId={uiState.openMenuId}
              />
            </Box>
          </>
        )}
      </Box>
      <ConTextMenu
        handleCreateFolder={handleCreateFolder}
        handleFileChange={handleChange}
        fileInputRef={fileInputRef}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        bgColor={bgColor}
        modalRef={modalRef}
        handleActionModal={handleActionModal}
        isModalOpen={isModalOpen}
        register={register}
        errors={errors}
        handleSubmit={handleSubmit}
        isPendingCreate={createFolderMutation.isPending}
        selectedFile={selectedFile}
      />
      {uiState.deleteConfirm && (
        <ModalDelete
          deleteConfirm={uiState.deleteConfirm}
          updateUiState={updateUiState}
          handleDelete={handleDelete}
          isPending={deleteFileMutation.isPending}
        />
      )}
      {uiState.renameId && (
        <ModalRename
          renameId={uiState.renameId}
          handleRename={handleRename}
          updateUiState={updateUiState}
          register={register}
          errors={errors}
          isPending={renameFileMutation.isPending}
        />
      )}
    </Container>
  )
}

const Drive: React.FC<DriveProps> = ({
  folder_id,
  name_folder,
  componentToUpload,
  isOpen,
  onClose,
  projectId,
  accountId,
  handleUploadSuccess,
}) => {
  const { t } = useTranslation()

  const handleClose = () => {
    if (onClose) onClose()
    if (handleUploadSuccess) handleUploadSuccess()
  }

  return (
    <>
      <DialogRoot
        size={"cover"}
        open={isOpen}
        trapFocus={false}
        motionPreset="slide-in-bottom"
      >
        <DialogTrigger asChild>
          {componentToUpload ?? (
            <Button variant={"outline"} color={"teal.600"}>
              Upload
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("components.driver.title")}</DialogTitle>
            <DialogCloseTrigger asChild onClick={handleClose} />
          </DialogHeader>
          <DialogBody>
            <DriveCpnt
              folder_id={folder_id}
              name_folder={name_folder}
              projectId={projectId}
              accountId={accountId}
            />
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default Drive
