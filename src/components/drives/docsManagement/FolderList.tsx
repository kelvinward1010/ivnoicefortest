import { useColorModeValue } from "@/components/ui/color-mode"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { colorIconFolder } from "@/constants/drive"
import type { DriveItem } from "@/types/drive"
import { Box, Button, Portal } from "@chakra-ui/react"
import { useEffect } from "react"
import type { UseFormSetValue } from "react-hook-form"
import { FaFolder } from "react-icons/fa"
import { FiEdit, FiMoreVertical } from "react-icons/fi"
import { MdDelete } from "react-icons/md"
import type { FieldInput, uiState } from "."

interface FolderListProps {
  folders: DriveItem[]
  handleFolderClick: (id: string, name: string) => void
  updateUiState: (key: keyof uiState, value: any) => void
  setValue: UseFormSetValue<FieldInput>
  bgColor: string
  isGridView: boolean
  openMenuId: string | null
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  handleFolderClick,
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
      {folders.map((folder) => (
        <Box
          key={folder.id}
          p="10px"
          border="1px solid #ccc"
          borderRadius="5px"
          cursor="pointer"
          bgColor={bgColorItem}
          display="flex"
          alignItems="center"
          justifyContent={"space-between"}
          width={isGridView ? "190px" : "full"}
          height={isGridView ? "40px" : "40px"}
          transition="all 0.3s ease-in-out"
          _hover={{ boxShadow: "md", background: bgColorItemHover }}
        >
          <Box
            onClick={() => handleFolderClick(folder.id, folder.name)}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            maxW={isGridView ? "150px" : "full"}
            flex={1}
            minW={"0"}
            px={2}
            display={"flex"}
            justifyContent={"start"}
            alignItems={"center"}
            gap={2}
          >
            <FaFolder size={17} color={colorIconFolder} /> {folder.name}
          </Box>
          <MenuRoot open={openMenuId === folder.id}>
            <MenuTrigger asChild>
              <Button
                variant="ghost"
                size={"xs"}
                onClick={(e) => {
                  e.stopPropagation()
                  updateUiState(
                    "openMenuId",
                    openMenuId === folder.id ? null : folder.id,
                  )
                }}
              >
                <FiMoreVertical />
              </Button>
            </MenuTrigger>
            <Portal>
              <MenuContent
                zIndex={"modal"}
                position="fixed"
                className="menu-container"
                onMouseEnter={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem
                  alignItems={"center"}
                  cursor={"pointer"}
                  value="delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    updateUiState("deleteConfirm", folder.id)
                  }}
                  color="red"
                >
                  <MdDelete color="red" size={16} /> Delete
                </MenuItem>
                <MenuItem
                  alignItems={"center"}
                  cursor={"pointer"}
                  value="rename"
                  onClick={() => {
                    updateUiState("renameId", folder.id)
                    setValue("reName", folder.name)
                    updateUiState("openMenuId", null)
                  }}
                  color={buttonColor}
                >
                  <FiEdit /> Rename
                </MenuItem>
              </MenuContent>
            </Portal>
          </MenuRoot>
        </Box>
      ))}
    </Box>
  )
}

export default FolderList
