import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { getDriveLinks } from "@/constants/drive"
import { Button, Text } from "@chakra-ui/react"

interface PreviewDocs {
  fieldID: string
  name_docs?: string
  componentToPreview?: React.ReactNode
}

export const PreviewDocs: React.FC<PreviewDocs> = ({
  fieldID,
  name_docs,
  componentToPreview,
}) => {
  return (
    <DrawerRoot size="lg">
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        {componentToPreview ?? (
          <Button variant="outline" size="sm">
            Open Preview
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="w-screen h-screen flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Preview Document</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="flex-grow">
          <Text>[{name_docs}]</Text>
          {fieldID ? (
            <iframe
              src={getDriveLinks(fieldID).webPreviewLink}
              width={"100%"}
              height={"90%"}
              allowFullScreen
              title="Preview docs"
            />
          ) : (
            <Text textAlign={"center"}>Something went wrong!</Text>
          )}
        </DrawerBody>
        <DrawerFooter>
          <DrawerActionTrigger asChild>
            <Button variant="outline">Close</Button>
          </DrawerActionTrigger>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  )
}
