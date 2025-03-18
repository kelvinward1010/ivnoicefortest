import { useColorModeValue } from "@/components/ui/color-mode"
import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { Tooltip } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { AiOutlineDollarCircle } from "react-icons/ai"
import { BiWorld } from "react-icons/bi"
import { FaRegCalendarAlt } from "react-icons/fa"
import { FiHome } from "react-icons/fi"
import { PiInvoice } from "react-icons/pi"
import { RiAccountCircleLine } from "react-icons/ri"

interface SidebarItemsProps {
  showSidebar: boolean
}

const SidebarItems = ({ showSidebar }: SidebarItemsProps) => {
  const { t } = useTranslation()
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")
  const items = [
    {
      icon: FiHome,
      title: t("components.common.SidebarItems.dashboard"),
      path: "/",
    },
    {
      icon: RiAccountCircleLine,
      title: t("components.common.SidebarItems.account"),
      path: "/accounts",
    },
    {
      icon: BiWorld,
      title: t("components.common.SidebarItems.project"),
      path: "/projects",
    },
    {
      icon: FaRegCalendarAlt,
      title: t("components.common.SidebarItems.timesheet"),
      path: "/timesheet",
    },
    {
      icon: AiOutlineDollarCircle,
      title: t("components.common.SidebarItems.expense"),
      path: "/expense",
    },
    {
      icon: PiInvoice,
      title: t("components.common.SidebarItems.invoice"),
      path: "/invoices",
    },
  ]

  const [showText, setShowText] = useState(false)

  useEffect(() => {
    if (showSidebar) {
      const timer = setTimeout(() => setShowText(true), 50)
      return () => clearTimeout(timer)
    }
    setShowText(false)
  }, [showSidebar])

  const listItems = items.map(({ icon, title, path }) => (
    <Link
      to={path}
      key={title}
      style={{ textDecoration: "none", width: "100%" }}
    >
      {({ isActive }: { isActive: boolean }) => (
        <Flex
          w="100%"
          p={2}
          gap={3}
          bg={isActive ? bgActive : "transparent"}
          borderRadius="8px"
          _hover={{ bg: bgActive }}
          align="center"
          mb={1}
          justify={showSidebar ? "start" : "center"}
        >
          <Tooltip content={title} showArrow>
            <Icon as={icon} alignSelf="center" boxSize="18px" />
          </Tooltip>
          {showText && <Text ml={2}>{title}</Text>}
        </Flex>
      )}
    </Link>
  ))

  return <Box>{listItems}</Box>
}

export default SidebarItems
