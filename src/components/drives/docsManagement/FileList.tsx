import { useColorModeValue } from "@/components/ui/color-mode"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { getDriveLinks } from "@/constants/drive"
import type { DriveItem } from "@/types/drive"
import { Box, Button, Flex, Image, Link, Portal, Text } from "@chakra-ui/react"
import { useEffect } from "react"
import type { UseFormSetValue } from "react-hook-form"
import { FaFileAlt } from "react-icons/fa"
import { FiEdit, FiMoreVertical } from "react-icons/fi"
import { MdDelete } from "react-icons/md"
import type { FieldInput, uiState } from "."

interface FileListProps {
  files: DriveItem[]
  updateUiState: (key: keyof uiState, value: any) => void
  setValue: UseFormSetValue<FieldInput>
  bgColor: string
  isGridView: boolean
  openMenuId: string | null
}

const FileList: React.FC<FileListProps> = ({
  files,
  updateUiState,
  setValue,
  bgColor,
  isGridView,
  openMenuId,
}) => {
  const bgColorItem = useColorModeValue("gray.200", "ui.dark")
  const bgColorItemHover = useColorModeValue("gray.200", "gray.600")
  const buttonColor = useColorModeValue("blue.700", "blue.600")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openMenuId &&
        event.target instanceof HTMLElement &&
        !event.target.closest(".menu-container")
      ) {
        updateUiState("openMenuId", null)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [openMenuId, updateUiState])

  return (
    <Box
      w="full"
      bgColor={bgColor}
      display="flex"
      flexDirection={isGridView ? "row" : "column"}
      flexWrap={isGridView ? "wrap" : "nowrap"}
      gap="1rem"
      p={2}
    >
      {files.map((file) => (
        <Flex
          key={file.id}
          p="10px"
          border="1px solid #ccc"
          borderRadius="5px"
          cursor="pointer"
          bgColor={bgColorItem}
          alignItems="center"
          flexDirection={isGridView ? "column" : "row"}
          justifyContent={isGridView ? "start" : "space-between"}
          width={isGridView ? "190px" : "full"}
          height={isGridView ? "200px" : "40px"}
          transition="all 0.3s ease-in-out"
          _hover={{ boxShadow: "md", background: bgColorItemHover }}
        >
          <Flex
            width="full"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Text
              fontSize="sm"
              fontWeight="bold"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              maxWidth="80%"
              marginBottom={"-1.5"}
            >
              {file.name}
            </Text>
            <MenuRoot open={openMenuId === file.id}>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  size={"xs"}
                  marginBottom={"-1.5"}
                  onClick={(e) => {
                    e.stopPropagation()
                    updateUiState(
                      "openMenuId",
                      openMenuId === file.id ? null : file.id,
                    )
                  }}
                >
                  <FiMoreVertical />
                </Button>
              </MenuTrigger>
              <Portal>
                <MenuContent className="menu-container" zIndex={"modal"}>
                  <MenuItem
                    alignItems={"center"}
                    cursor={"pointer"}
                    value="delete"
                    onClick={() => updateUiState("deleteConfirm", file.id)}
                    color="red"
                  >
                    <MdDelete color="red" size={16} /> Delete
                  </MenuItem>
                  <MenuItem
                    alignItems={"center"}
                    cursor={"pointer"}
                    value="rename"
                    onClick={() => {
                      updateUiState("renameId", file.id)
                      setValue("reName", file.name)
                      updateUiState("openMenuId", null)
                    }}
                    color={buttonColor}
                  >
                    <FiEdit /> Rename
                  </MenuItem>
                </MenuContent>
              </Portal>
            </MenuRoot>
          </Flex>
          <Link
            href={getDriveLinks(file.id).viewLink}
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {file.thumbnailLink ? (
              <Image
                src={file.thumbnailLink}
                alt={file.name}
                width={isGridView ? "200px" : ""}
                height={isGridView ? "130px" : ""}
                objectFit="cover"
                borderRadius="4px"
                display={!isGridView ? "none" : ""}
              />
            ) : file.mimeType.startsWith("image/") ? (
              <Image
                src={getDriveLinks(file.id).directLink}
                alt={file.name}
                width={isGridView ? "200px" : ""}
                height={isGridView ? "130px" : ""}
                objectFit="cover"
                borderRadius="4px"
                display={!isGridView ? "none" : ""}
              />
            ) : (
              isGridView && (
                <Box fontSize="xl">
                  <FaFileAlt />
                </Box>
              )
            )}
          </Link>
        </Flex>
      ))}
    </Box>
  )
}

export default FileList
