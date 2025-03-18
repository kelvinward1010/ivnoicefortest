import { Box, Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute } from "@tanstack/react-router"

import Header from "@/components/common/Header"
import Sidebar from "@/components/common/Sidebar"
import { ToastContainer } from "react-toastify"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  // beforeLoad: async () => {
  //   if (!isLoggedIn()) {
  //     throw redirect({
  //       to: "/login",
  //     })
  //   }
  // },
})

function Layout() {
  return (
    <>
      <Flex direction="column" h="100vh">
        <Box as="header" h="71px" w="100%" zIndex={999}>
          <Header />
        </Box>
        <Flex flex="1" overflow="hidden">
          <Sidebar />
          <Flex flex="1" bg="ui.light" overflowY="auto">
            <Outlet />
          </Flex>
        </Flex>
      </Flex>
      <ToastContainer />
    </>
  )
}
