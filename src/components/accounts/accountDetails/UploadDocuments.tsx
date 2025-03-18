import Drive from "@/components/drives/docsManagement"
import { PreviewDocs } from "@/components/drives/previewDocs/PreviewDocs"
import { useColorModeValue } from "@/components/ui/color-mode"
import { useGetFolderFiltered } from "@/services/drives"
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Spinner,
  Text,
} from "@chakra-ui/react"
import { FiFileText } from "react-icons/fi"
import { HiUpload } from "react-icons/hi"

interface UploadDocumentsProps {
  accountId: string
}

const UploadDocuments: React.FC<UploadDocumentsProps> = ({ accountId }) => {
  const textColor = useColorModeValue("black", "white")
  const boxBg = useColorModeValue("gray.100", "gray.800")
  const fileBg = useColorModeValue("gray.200", "gray.700")
  const docsColor = useColorModeValue("blue.500", "blue.300")

  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.700")

  const { data, main_folder, isLoading, refetch } = useGetFolderFiltered({
    accountId,
  })

  const ndaFiles = data.nda?.files || []
  const maFiles = data.ma?.files || []

  const handleUploadSuccess = () => {
    refetch()
  }

  return (
    <Box flex="1">
      <Flex w="full" justify="space-between" align="center" mb={4}>
        <Heading size="lg" color={textColor}>
          File Attachment
        </Heading>
        <Drive
          componentToUpload={
            <Button
              variant="outline"
              size="md"
              as="label"
              bg={buttonColor}
              color={buttontextColor}
              _hover={{ bg: buttonHoverColor }}
            >
              <HiUpload /> Upload file
            </Button>
          }
          folder_id={main_folder.id}
          name_folder={main_folder.name}
          accountId={accountId}
          handleUploadSuccess={handleUploadSuccess}
        />
      </Flex>
      {isLoading ? (
        <Flex w={"full"} gap={2} justify="center" align="center" height="100px">
          <Spinner size="md" />
          <Text mt={2} color={textColor}>
            Loading...
          </Text>
        </Flex>
      ) : (
        <Flex gap={6} align="start" flexWrap="wrap" p={2} bg={boxBg}>
          {["NDA", "MA"].map((title, index) => (
            <Box
              key={title}
              flex={1}
              p={4}
              borderRadius="lg"
              minW="400px"
              maxW="500px"
              display="flex"
              flexDirection="column"
            >
              <Text fontWeight="bold" color={textColor} mb={3} flexShrink={0}>
                {title}
              </Text>
              <Box flex={1} overflowY="auto" maxH="300px">
                {(index === 0 ? ndaFiles : maFiles).length > 0 ? (
                  <Flex direction="column" gap={3}>
                    {(index === 0 ? ndaFiles : maFiles)
                      .slice(0, 5)
                      .map((file) => (
                        <PreviewDocs
                          key={file.id}
                          fieldID={file.id}
                          name_docs={file.name}
                          componentToPreview={
                            <Flex
                              _hover={{
                                color: "blue.500",
                                textDecoration: "underline",
                              }}
                              cursor={"pointer"}
                              align="center"
                              p={3}
                              bg={fileBg}
                              borderRadius="md"
                              w="full"
                            >
                              <Icon as={FiFileText} mr={3} color={docsColor} />
                              <Text
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                color={docsColor}
                              >
                                {file.name}
                              </Text>
                            </Flex>
                          }
                        />
                      ))}
                  </Flex>
                ) : (
                  <Text color="gray.400">No data available</Text>
                )}
              </Box>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  )
}

export default UploadDocuments
