import { useEffect, useState } from "react"
import LogoBlueOc from "/assets/images/blueoc.svg"

import SidebarItems from "@/components/common/SidebarItems"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react"
import { IoIosArrowBack } from "react-icons/io"
import { IoIosArrowForward } from "react-icons/io"

const Sidebar = () => {
  const bgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const sidebarBgColor = useColorModeValue("gray.200", "ui.secondary")
  const [showSidebar, setShowSidebar] = useState<boolean>(() => {
    const savedState = localStorage.getItem("showSidebar")
    return savedState === "true"
  })

  const handleToggleCollapse = () => {
    setShowSidebar(!showSidebar)
  }

  useEffect(() => {
    localStorage.setItem("showSidebar", showSidebar.toString())
  }, [showSidebar])

  return (
    <Box
      shadow={"sm"}
      bg={bgColor}
      h={"calc(100vh - 71px)"}
      position="sticky"
      zIndex={1}
      display={"flex"}
      transition="all 0.1s ease-in-out"
      w={showSidebar ? "250px" : "80px"}
    >
      <Flex
        position={"relative"}
        flexDir="column"
        justify="space-between"
        p={4}
        borderRadius={8}
        gap={6}
        w={"100%"}
        transition="padding 0.3s ease-in-out"
        mt={5}
      >
        <IconButton
          position={"absolute"}
          top={"50%"}
          right={"-16px"}
          size={"xs"}
          border={"none"}
          rounded={"full"}
          _hover={{ bgColor: "gray.300" }}
          transform={"translateY(-50%)"}
          variant={"outline"}
          bgColor={sidebarBgColor}
          onClick={handleToggleCollapse}
          transition="all 0.3s ease-in-out"
        >
          {showSidebar ? (
            <IoIosArrowBack color="black" />
          ) : (
            <IoIosArrowForward color="black" />
          )}
        </IconButton>
        <Flex direction={"column"} justifyContent={"space-between"}>
          <SidebarItems showSidebar={showSidebar} />
        </Flex>
        {showSidebar ? (
          <Flex
            align="center"
            direction="column"
            alignItems="flex-start"
            flexShrink={0}
            m={3}
            opacity={0.8}
          >
            <Flex justifyContent="flex-start" gap={2} mb={1}>
              <Image src={LogoBlueOc} alt="Logo" w="28px" />
              <Flex justifyContent="center" alignItems="center">
                <Text fontSize="md" fontWeight="black">
                  BlueOC
                </Text>
              </Flex>
            </Flex>
            <Text textAlign="center" fontSize="xs" fontWeight="semibold">
              Think IT - Think VietNam
            </Text>
            <Text textAlign="center" fontSize="xx-small" fontWeight="normal">
              Copyright © BLUEOC 2025
            </Text>
            <Text textAlign="center" fontSize="xx-small" fontWeight="normal">
              All rights reserved. © 2025.
            </Text>
          </Flex>
        ) : (
          <Flex alignItems={"center"} justifyContent={"center"}>
            <Image src={LogoBlueOc} alt="Logo" w="28px" />
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

export default Sidebar
