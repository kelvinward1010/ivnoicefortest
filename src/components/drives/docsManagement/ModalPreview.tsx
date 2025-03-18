import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button, Image, Text } from "@chakra-ui/react"

interface ModalPreviewProps {
  handleUploadFile: () => void
  previewUrl: string | null
  setPreviewUrl: (value: string | null) => void
  setSelectedFile: (value: File | null) => void
  selectedFile: File | null
  isPending: boolean
}

const ModalPreview: React.FC<ModalPreviewProps> = ({
  handleUploadFile,
  previewUrl,
  setPreviewUrl,
  selectedFile,
  setSelectedFile,
  isPending,
}) => {
  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const buttontextColor = useColorModeValue("gray.100", "white")

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <DialogRoot
      size={"lg"}
      placement="center"
      motionPreset="slide-in-bottom"
      open={true}
    >
      <DialogContent onClick={handleModalClick}>
        <DialogHeader>
          <DialogTitle>File Preview</DialogTitle>
          <DialogCloseTrigger onClick={handleCancel} />
        </DialogHeader>
        <DialogBody>
          {previewUrl ? (
            <Image src={previewUrl} alt="File Preview" maxW="100%" />
          ) : (
            selectedFile && (
              <Text>
                {selectedFile.name} ({selectedFile.type.split("/")[1]})
              </Text>
            )
          )}
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button onClick={handleCancel}>Cancel</Button>
          </DialogActionTrigger>
          <Button
            loading={isPending}
            bg={buttonColor}
            color={buttontextColor}
            onClick={handleUploadFile}
          >
            Confirm Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default ModalPreview
