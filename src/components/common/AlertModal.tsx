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
import { Box, Button, Text } from "@chakra-ui/react"
import type React from "react"
import { useState } from "react"

interface AlertModalProps {
  onClick: () => void
  title: string
  bodyFirstLine: string
  bodySecondLine?: string
  buttonContent: string
  triggerButton?: React.ReactNode | string
  buttonColorPalette?: string
}

const AlertModal = ({
  onClick,
  title,
  bodyFirstLine,
  bodySecondLine,
  buttonContent,
  triggerButton,
  buttonColorPalette = "blue",
}: AlertModalProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Box>
      <DialogRoot
        role="alertdialog"
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen.open)
        }}
      >
        <DialogTrigger>{triggerButton}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle tabIndex={-1}>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={3}>{bodyFirstLine}</Text>
            {bodySecondLine && <Text>{bodySecondLine}</Text>}
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              colorPalette={buttonColorPalette}
              onClick={() => {
                onClick()
                setOpen(false)
              }}
            >
              {buttonContent}
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Box>
  )
}

export default AlertModal
