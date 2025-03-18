import Menu from "@/components/notifications/Menu"
import SubMenu from "@/components/notifications/SubMenu"
import { useColorModeValue } from "@/components/ui/color-mode"
import { MenuContent, MenuRoot, MenuTrigger } from "@/components/ui/menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  updateAllNotifications,
  updateNotificationsStatus,
} from "@/services/notification"
import {
  type NotificationPublic,
  NotificationStatus,
} from "@/types/notification.tsx"
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useRef } from "react"
import { useEffect, useState } from "react"
import { IoMdNotificationsOutline } from "react-icons/io"

interface NotiButtonProps {
  socket: WebSocket | null
}

export default function NotiButton({ socket }: NotiButtonProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [notificationList, setNotificationList] = useState<
    NotificationPublic[]
  >([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadNotificationList, setUnreadNotificationList] = useState<
    NotificationPublic[]
  >([])
  const [readNotificationList, setReadNotificationList] = useState<
    NotificationPublic[]
  >([])
  const filterOptions: { label: string; value: "ALL" | "READ" | "UNREAD" }[] = [
    { label: "All", value: "ALL" },
    { label: "Read", value: "READ" },
    { label: "Unread", value: "UNREAD" },
  ]

  const [filterType, setFilterType] = useState<"ALL" | "READ" | "UNREAD">("ALL")
  const filteredNotifications = (() => {
    if (filterType === "UNREAD") return unreadNotificationList
    if (filterType === "READ") return readNotificationList
    return notificationList
  })()
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      fetchNotifications({
        pageSize: 20,
        pageIndex: 0,
        sortBy: "created_at",
        sortOrder: "desc",
        search: "",
      }),
  })

  const bgButtonColor = useColorModeValue("gray.400", "black")
  const buttonColorOrigin = useColorModeValue("black", "white")
  const textColor = useColorModeValue("black", "white")
  const borderColor = useColorModeValue("gray.100", "gray.600")
  const contentColor = useColorModeValue("ui.light", "rgb(39 39 42)")
  const bgHoverColor = useColorModeValue("#c0c3c8", "#47494d")
  const bgFilterColor = useColorModeValue("#c0c3c8", "#47494d")
  const loadingColor = useColorModeValue("#f2f4f7", "#333334")
  const badgeColor = useColorModeValue("white", "white")
  const skeletonCount = 7
  const { open, onToggle } = useDisclosure()
  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications?.number_of_unread)
      setNotificationList(notifications?.notifications)
    }
  }, [notifications])
  useEffect(() => {
    setUnreadNotificationList(
      notificationList.filter(
        (notification) => notification.status === NotificationStatus.UNREAD,
      ),
    )
    setReadNotificationList(
      notificationList.filter(
        (notification) => notification.status === NotificationStatus.READ,
      ),
    )
  }, [notificationList])
  useEffect(() => {
    if (!socket) return
    const handleNotification = (data: NotificationPublic) => {
      setNotificationList((prev) => [data, ...prev])
      setUnreadCount((prev) => prev + 1)
    }
    socket.onmessage = (event) => {
      handleNotification(JSON.parse(event.data))
    }
  }, [socket])
  return (
    <Box position="relative">
      <MenuRoot
        closeOnSelect={false}
        composite={true}
        open={open}
        onPointerDownOutside={() => {
          onToggle()
        }}
      >
        <MenuTrigger asChild>
          <Box>
            <IconButton
              aria-label="Search database"
              rounded={"full"}
              _hover={{ bg: bgButtonColor }}
              onClick={onToggle}
              backgroundColor={"transparent"}
              _active={{
                transform: "scale(1.1)",
                transition: "all 0.3s",
              }}
            >
              <IoMdNotificationsOutline
                size={"22px"}
                color={buttonColorOrigin}
              />
              {unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  borderRadius="full"
                  px={2}
                  color={badgeColor}
                  bg={"red.500"}
                  fontSize="0.8em"
                >
                  {unreadCount}
                </Badge>
              )}
            </IconButton>
          </Box>
        </MenuTrigger>
        <MenuContent
          maxH="650px"
          w="350px"
          overflowY="scroll"
          p={2}
          backgroundColor={contentColor}
          ref={contentRef}
          css={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: contentColor,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(100, 100, 100, 0.5)",
              borderRadius: "4px",
            },
          }}
        >
          <Container
            autoFocus={false}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderColor={borderColor}
            py={2}
            px={2}
          >
            <Text
              color={textColor}
              fontSize="xl"
              fontWeight="semibold"
              userSelect={"none"}
            >
              Notification
            </Text>
            <SubMenu
              isRootMenu={true}
              updateNotificationsStatus={updateAllNotifications}
              deleteNotification={deleteAllNotifications}
              setUnreadCount={setUnreadCount}
              setNotificationList={setNotificationList}
            />
          </Container>
          <HStack mb={4}>
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                backgroundColor={
                  filterType === option.value ? bgFilterColor : contentColor
                }
                color={textColor}
                borderRadius={"4xl"}
                _hover={{ bg: bgHoverColor }}
                onClick={() => setFilterType(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </HStack>
          {isLoading && !notifications ? (
            <Stack gap={10}>
              {Array(skeletonCount)
                .fill(null)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="shine"
                    width="full"
                    height="10"
                    css={{
                      "--start-color": loadingColor,
                      "--end-color": loadingColor,
                    }}
                  />
                ))}
            </Stack>
          ) : notificationList && filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <Box key={notification.id}>
                <Menu
                  isLastNotification={
                    index === filteredNotifications.length - 1
                  }
                  contentRef={contentRef}
                  notification={notification}
                  updateNotificationsStatus={updateNotificationsStatus}
                  deleteNotification={deleteNotification}
                  setUnreadCount={setUnreadCount}
                  setNotificationList={setNotificationList}
                />
              </Box>
            ))
          ) : (
            <Flex
              opacity={0.7}
              color={textColor}
              fontStyle="italic"
              py={2}
              px={4}
              justifyContent="center"
            />
          )}
        </MenuContent>
      </MenuRoot>
    </Box>
  )
}
