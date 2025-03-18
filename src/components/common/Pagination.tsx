import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { calculateTotalPages } from "@/utils"
import {
  Box,
  Flex,
  HStack,
  NativeSelectField,
  NativeSelectRoot,
  Text,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HiMiniChevronDown } from "react-icons/hi2"
import { useColorModeValue } from "../ui/color-mode"

interface PaginationProps {
  currentPage: number
  onPageChange: (newPage: number) => void
  pageSize?: number
  onPageSizeChange?: (newPageSize: number) => void
  count: number
}

const Pagination = (props: PaginationProps) => {
  const [pageSize, setPageSize] = useState(props.pageSize || 10)
  const textColor = useColorModeValue("black", "white")
  const [currentPage, setCurrentPage] = useState(props.currentPage)
  const borderColor = useColorModeValue("#d4d4d8", "#52525b")
  const totalPages = calculateTotalPages(props.count, pageSize)
  const bgOptionsColor = useColorModeValue("white", "gray.800")
  const iconColor = useColorModeValue("black", "white")

  useEffect(() => {
    setCurrentPage(props.currentPage)
  }, [props.currentPage])

  const handlePageChange = (details: { page: number }) => {
    const newPage = details.page
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
      props.onPageChange(newPage)
    }
  }

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedPageSize = Number.parseInt(event.target.value)

    if (selectedPageSize !== pageSize) {
      const currentOffset = (currentPage - 1) * pageSize
      const newPage = Math.floor(currentOffset / selectedPageSize) + 1

      setPageSize(selectedPageSize)
      setCurrentPage(newPage)

      if (props.onPageSizeChange) {
        props.onPageSizeChange(selectedPageSize)
      }
      if (props.onPageChange) {
        props.onPageChange(newPage)
      }
    }
  }

  return (
    <>
      {props.count > 0 && (
        <Flex justifyContent="space-between" mt={4} mb={4} alignItems="center">
          <Box flex="1">
            <PaginationRoot
              variant="solid"
              count={props.count}
              pageSize={pageSize}
              page={currentPage}
              onPageChange={handlePageChange}
            >
              <HStack>
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </HStack>
            </PaginationRoot>
          </Box>

          <HStack alignItems="center">
            <Text fontSize="sm" color={textColor} marginRight={2}>
              Total Pages: {totalPages}
            </Text>
            <Box position="relative" marginRight={2}>
              <NativeSelectRoot size="sm" width="110px">
                <NativeSelectField
                  value={pageSize}
                  bg={bgOptionsColor}
                  onChange={handlePageSizeChange}
                  textAlign="center"
                  fontSize="sm"
                  style={{
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    padding: "2px",
                    appearance: "none",
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </NativeSelectField>
              </NativeSelectRoot>

              <Box
                position="absolute"
                top="50%"
                right="10px"
                transform="translateY(-50%)"
                pointerEvents="none"
              >
                <HiMiniChevronDown size={16} color={iconColor} />
              </Box>
            </Box>
          </HStack>
        </Flex>
      )}
    </>
  )
}

export default Pagination
