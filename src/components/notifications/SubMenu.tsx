import AlertModal from "@/components/common/AlertModal"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  type NotificationPublic,
  NotificationStatus,
} from "@/types/notification.tsx"
import { Icon, IconButton, useDisclosure } from "@chakra-ui/react"
import { useCallback, useEffect } from "react"
import { HiDotsHorizontal } from "react-icons/hi"
interface SubMenuProps {
  isLastNotification?: any
  contentRef?: any
  boxRef?: any
  isRootMenu?: boolean
  onToggleTrigger?: () => void
  notification?: NotificationPublic
  updateNotificationsStatus: (notificationId?: string) => Promise<void>
  deleteNotification: (notificationId?: string) => Promise<void>
  setUnreadCount: (updater: (prev: number) => number) => void
  setNotificationList: (
    updater: (prev: NotificationPublic[]) => NotificationPublic[],
  ) => void
}
export default function SubMenu({
  isLastNotification,
  contentRef,
  boxRef,
  isRootMenu,
  onToggleTrigger,
  notification,
  updateNotificationsStatus,
  deleteNotification,
  setUnreadCount,
  setNotificationList,
}: SubMenuProps) {
  const { open, onToggle } = useDisclosure()
  const bgHoverColor = useColorModeValue("gray.100", "gray.600")
  const settingColor = useColorModeValue("#f2f4f7", "#47494d")
  const contentColor = useColorModeValue("#fefefe", "#3b3c3e")
  const borderColor = useColorModeValue("gray.300", "transparent")
  const checkPosition = useCallback(() => {
    if (boxRef.current && open) {
      const rect = boxRef.current.getBoundingClientRect()
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        if (onToggleTrigger != null) {
          onToggleTrigger()
        }
        onToggle()
      }
    }
  }, [open, boxRef, onToggleTrigger, onToggle])

  useEffect(() => {
    if (contentRef) {
      contentRef.current.inert = false
      contentRef.current.addEventListener("scroll", checkPosition)
    }
  }, [contentRef, checkPosition])
  const handleDeleteNotification = () => {
    if (onToggleTrigger != null) {
      onToggleTrigger()
    }
    onToggle()
    if (notification) {
      deleteNotification(notification.id).then(() => {
        const notificationId = notification.id
        const isRead = notification.status === NotificationStatus.READ
        setNotificationList((prev) =>
          prev.filter((notification) => notification.id !== notificationId),
        )
        if (!isRead) {
          setUnreadCount((prev) => prev - 1)
        }
      })
    } else {
      deleteNotification().then(() => {
        setNotificationList(() => [])
        setUnreadCount(() => 0)
      })
    }
  }
  const handleUpdateStatusNotification = () => {
    if (onToggleTrigger != null) {
      onToggleTrigger()
    }
    onToggle()
    if (notification != null) {
      updateNotificationsStatus(notification.id).then(() => {
        setUnreadCount((prev) =>
          notification.status === NotificationStatus.UNREAD ? prev - 1 : prev,
        )
        setNotificationList((prev) =>
          prev.map((a) =>
            a.id === notification.id
              ? { ...a, status: NotificationStatus.READ }
              : a,
          ),
        )
      })
    } else {
      updateNotificationsStatus().then(() => {
        setNotificationList((prev) => {
          return prev.map((a) => {
            return { ...a, status: NotificationStatus.READ }
          })
        })
        setUnreadCount(() => 0)
      })
    }
  }

  return (
    <MenuRoot
      open={open}
      onPointerDownOutside={() => {
        if (onToggleTrigger != null) {
          onToggleTrigger()
        }
        onToggle()
      }}
    >
      <MenuTrigger value="open-recent">
        <IconButton
          aria-label="Search database"
          rounded={"full"}
          bg={contentColor}
          _hover={{ bg: settingColor }}
          size="xs"
          borderWidth="1px"
          borderColor={borderColor}
          _active={{
            transform: "scale(1.1)",
            transition: "all 0.3s",
          }}
          color={"blue.500"}
          onClick={() => {
            if (onToggleTrigger != null) {
              onToggleTrigger()
            }
            onToggle()
          }}
        >
          <Icon as={HiDotsHorizontal}> </Icon>
        </IconButton>
      </MenuTrigger>
      <MenuContent
        backgroundColor={contentColor}
        right={-6}
        maxH="650px"
        portalRef={boxRef}
        position="absolute"
        zIndex={1002}
        style={{
          top: isLastNotification ? "auto" : 0,
          bottom: isLastNotification ? 50 : "auto",
        }}
      >
        {isRootMenu ? (
          <>
            <MenuItem
              value=""
              bg={"transparent"}
              _hover={{
                bg: bgHoverColor,
              }}
              my={3}
            >
              <AlertModal
                triggerButton="Mark all as read"
                title="Mark all as read"
                bodyFirstLine="Are you sure ?"
                buttonContent="Mark"
                onClick={handleUpdateStatusNotification}
              />
            </MenuItem>
            <MenuItem
              value=""
              bg={"transparent"}
              _hover={{
                bg: bgHoverColor,
              }}
              my={3}
            >
              <AlertModal
                triggerButton="Delete all"
                title="Delete all"
                bodyFirstLine="Are you sure ?"
                buttonContent="Delete"
                onClick={handleDeleteNotification}
              />
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              value=""
              onClick={() => {
                if (onToggleTrigger != null) {
                  onToggleTrigger()
                }
                onToggle()
                if (notification != null) {
                  updateNotificationsStatus(notification.id).then(() => {
                    setUnreadCount((prev) =>
                      notification.status === NotificationStatus.UNREAD
                        ? prev - 1
                        : prev,
                    )
                    setNotificationList((prev) =>
                      prev.map((a) =>
                        a.id === notification.id
                          ? { ...a, status: NotificationStatus.READ }
                          : a,
                      ),
                    )
                  })
                } else {
                  updateNotificationsStatus().then(() => {
                    setNotificationList((prev) => {
                      return prev.map((a) => {
                        return { ...a, status: NotificationStatus.READ }
                      })
                    })
                    setUnreadCount(() => 0)
                  })
                }
              }}
              bg={"transparent"}
              _hover={{
                bg: bgHoverColor,
              }}
              my={3}
            >
              Mark as Read
            </MenuItem>
            <MenuItem
              value=""
              bg={"transparent"}
              onClick={() => {
                if (onToggleTrigger != null) {
                  onToggleTrigger()
                }
                onToggle()
                if (notification) {
                  deleteNotification(notification.id).then(() => {
                    const notificationId = notification.id
                    const isRead =
                      notification.status === NotificationStatus.READ
                    setNotificationList((prev) =>
                      prev.filter(
                        (notification) => notification.id !== notificationId,
                      ),
                    )
                    if (!isRead) {
                      setUnreadCount((prev) => prev - 1)
                    }
                  })
                } else {
                  deleteNotification().then(() => {
                    setNotificationList(() => [])

                    setUnreadCount(() => 0)
                  })
                }
              }}
              _hover={{
                bg: bgHoverColor,
              }}
            >
              Delete
            </MenuItem>
          </>
        )}
      </MenuContent>
    </MenuRoot>
  )
}
