import SubMenu from "@/components/notifications/SubMenu"
import { useColorModeValue } from "@/components/ui/color-mode"
import { MenuItem } from "@/components/ui/menu"
import {
  type NotificationPublic,
  NotificationStatus,
} from "@/types/notification.tsx"
import { Box, Flex, Link, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { useRef } from "react"
interface MenuProps {
  isLastNotification: any
  contentRef: any
  notification: NotificationPublic
  updateNotificationsStatus: (notificationId?: string) => Promise<void>
  deleteNotification: (notificationId?: string) => Promise<void>
  setUnreadCount: (updater: (prev: number) => number) => void
  setNotificationList: (
    updater: (prev: NotificationPublic[]) => NotificationPublic[],
  ) => void
}

export default function Menu({
  isLastNotification,
  contentRef,
  notification,
  updateNotificationsStatus,
  deleteNotification,
  setUnreadCount,
  setNotificationList,
}: MenuProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const { open, onToggle } = useDisclosure()
  const bgHoverColor = useColorModeValue("gray.100", "gray.600")
  const textMessageColor = useColorModeValue("black", "white")
  const textActorColor = useColorModeValue("black", "gray.300")
  const onClickMenuItem = () => {
    if (notification.status === NotificationStatus.UNREAD) {
      updateNotificationsStatus(notification.id)
      setUnreadCount((prev) => prev - 1)
    }
  }
  return (
    <Flex position="relative" className="group">
      <MenuItem
        onClick={onClickMenuItem}
        className="submenu"
        value=""
        key={notification.id}
        _hover={{ bg: bgHoverColor }}
        display="flex"
        justifyContent="space-between"
        borderRadius="md"
        py={0}
        px={2}
        mb={1}
        gap={1}
        h="full"
        backgroundColor={
          notification.status === NotificationStatus.UNREAD
            ? useColorModeValue("blue.50", "gray.700")
            : useColorModeValue("white", "gray.800")
        }
      >
        <Link
          href={notification.link}
          maxW="100%"
          style={{
            textDecoration: "none",
            height: "100%",
            display: "block",
          }}
          flex={1}
        >
          <VStack align="start" flex={1} h="full" py={3}>
            <Text
              fontSize="sm"
              fontWeight="normal"
              fontFamily="Segoe UI, sans-serif"
              color={textMessageColor}
              maxW="100%"
              css={{
                display: "-webkit-box",
                WebkitLineClamp: "3",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {notification.message}
            </Text>
            <Text fontSize="xs" color={textActorColor} maxW="100%">
              Performed by: {notification.actor_id}
            </Text>
          </VStack>
        </Link>
      </MenuItem>
      <Box
        position="absolute"
        top={5}
        right={2}
        visibility={open ? "visible" : "hidden"}
        _groupHover={{ visibility: "visible" }}
        ref={boxRef}
      >
        <SubMenu
          isLastNotification={isLastNotification}
          contentRef={contentRef}
          boxRef={boxRef}
          onToggleTrigger={onToggle}
          notification={notification}
          updateNotificationsStatus={updateNotificationsStatus}
          deleteNotification={deleteNotification}
          setUnreadCount={setUnreadCount}
          setNotificationList={setNotificationList}
        />
      </Box>
    </Flex>
  )
}
