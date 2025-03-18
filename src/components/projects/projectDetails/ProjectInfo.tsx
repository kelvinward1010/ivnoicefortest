import type { ProjectPublic } from "@/client"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import useCustomToast from "@/hooks/useCustomToast"
import { CopyIcon } from "@chakra-ui/icons"
import {
  Box,
  Flex,
  Grid,
  Heading,
  Input,
  InputElement,
  Stack,
  Text,
} from "@chakra-ui/react"
const ProjectInfo = ({ projectDetail }: { projectDetail: ProjectPublic }) => {
  const copyColorIcon = useColorModeValue("blue", "white")
  const backGroundColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("black", "white")
  const borderColor = useColorModeValue("gray.300", "gray.600")
  const { showSuccess, showError } = useCustomToast()
  const inputStyles = {
    borderColor: borderColor,
    color: textColor,
    backgroundColor: backGroundColor,
    fontSize: "sm",
    width: "100%",
    _disabled: {
      opacity: 1,
      cursor: "not-allowed",
    },
  }

  if (!projectDetail) {
    return (
      <Text fontSize="lg" color="gray.500">
        {"No data "}
      </Text>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccess("Copy Successfully")
      })
      .catch(() => {
        showError("Copy Failed")
      })
  }

  const renderField = (label: string, value?: string, hasCopy = true) => (
    <Field label={label}>
      <InputGroup width="100%">
        <Box position="relative" width="100%">
          <Input
            disabled
            value={value ?? "N/A"}
            readOnly
            css={inputStyles}
            pr={hasCopy ? "2.5rem" : "0"}
          />
          {hasCopy && (
            <InputElement position="absolute" right="1px" top="1px">
              <CopyIcon
                style={{ color: copyColorIcon }}
                fontSize="lg"
                cursor="pointer"
                onClick={() => copyToClipboard(value ?? "")}
              />
            </InputElement>
          )}
        </Box>
      </InputGroup>
    </Field>
  )

  return (
    <Box ml={5} p={4} borderRadius="lg" shadow="md">
      <Stack mb={2}>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} mb={5}>
          I. Project Information
        </Heading>
      </Stack>

      <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4}>
        <Box>
          <Flex direction="column" gap={3}>
            {renderField("Project Name", projectDetail.name)}
            {renderField("PM Name", projectDetail.pm_name ?? undefined)}
            {renderField("Client PM", projectDetail.client_pm ?? undefined)}
            {renderField(
              "Client PM Phone Number",
              projectDetail.client_pm_phone_number ?? undefined,
            )}
            {renderField(
              "Client PM Email",
              projectDetail.client_pm_email ?? undefined,
            )}
            {renderField(
              "Start Date",
              projectDetail.start_date ?? undefined,
              false,
            )}
            {renderField(
              "Working Hours",
              projectDetail.working_hours?.toString() ?? undefined,
              false,
            )}
            {renderField(
              "Project Size",
              projectDetail.project_size?.toString() ?? undefined,
              false,
            )}
          </Flex>
        </Box>

        <Box>
          <Flex direction="column" gap={3}>
            {renderField(
              "Account Name",
              projectDetail.account_name ?? undefined,
            )}
            {renderField("RMO Name", projectDetail.rmo_name ?? undefined)}
            {renderField("Client PO", projectDetail.client_po ?? undefined)}
            {renderField(
              "Client PO Phone Number",
              projectDetail.client_po_phone_number ?? undefined,
            )}
            {renderField(
              "Client PO Email",
              projectDetail.client_po_email ?? undefined,
            )}
            {renderField(
              "End Date",
              projectDetail.end_date ?? undefined,
              false,
            )}
            {renderField(
              "Project Budget",
              projectDetail.project_budget?.toString() ?? undefined,
              false,
            )}
            {renderField("Status", projectDetail.status ?? undefined, false)}
          </Flex>
        </Box>
      </Grid>

      <Box mt={4}>
        <Field label={"Description"}>
          <Input
            value={projectDetail.description ?? ""}
            readOnly
            css={{ ...inputStyles }}
            width={"100%"}
            pr="0"
          />
        </Field>
      </Box>
    </Box>
  )
}

export default ProjectInfo
