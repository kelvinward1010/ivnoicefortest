import { Flex } from "@chakra-ui/react"
import type { ReactNode } from "@tanstack/react-router"

const BoxWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      gap={10}
      w={"full"}
      alignItems={"start"}
      justifyContent={"space-between"}
    >
      {children}
    </Flex>
  )
}

export default BoxWrapper
