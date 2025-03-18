import type { AccountPublic } from "@/client"
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
import { useTranslation } from "react-i18next"

const AccountInfor = ({ accountDetail }: { accountDetail: AccountPublic }) => {
  const copyColorIcon = useColorModeValue("blue", "white")
  const backGroundColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("black", "white")
  const borderColor = useColorModeValue("gray.300", "gray.600")
  const { showSuccess, showError } = useCustomToast()
  const { t } = useTranslation()
  const inputStyles = {
    borderColor: borderColor,
    color: textColor,
    backgroundColor: backGroundColor,
    fontSize: "sm",
    width: "100%",
    minWidth: "295px",
    _disabled: {
      opacity: 1,
      cursor: "not-allowed",
    },
  }

  if (!accountDetail) {
    return (
      <Box
        fontSize="lg"
        color="gray.500"
        style={{ textAlign: "center", marginTop: "20px" }}
      >
        <Text>
          {t(
            "components.accounts.accountDetails.AccountInfor.account_error_data_accountInfor",
          )}
        </Text>
      </Box>
    )
  }
  const copyToClipboard = (text: string) => {
    const tempInput = document.createElement("input")
    tempInput.value = text
    document.body.appendChild(tempInput)

    tempInput.select()
    try {
      const successful = document.execCommand("copy")

      if (successful) {
        showSuccess(
          `${t("components.accounts.accountDetails.AccountInfor.copy_success")} "${text}"`,
        )
      } else {
        throw new Error("Copy failed")
      }
    } catch (err) {
      showError(
        t("components.accounts.accountDetails.AccountInfor.copy_failed"),
      )
    } finally {
      document.body.removeChild(tempInput)
    }
  }
  const renderField = (label: string, value?: string, hasCopy = true) => (
    <Field label={label}>
      <InputGroup width="100%">
        <Box position="relative" width="100%">
          <Input
            disabled
            value={value ?? "N/A"}
            readOnly
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
            overflow={"hidden"}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"
                }}
              />
            </InputElement>
          )}
        </Box>
      </InputGroup>
    </Field>
  )

  return (
    <Box ml={5} p={4} borderRadius="lg" shadow="md" width={"full"}>
      <Stack mb={2}>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} mb={5}>
          {t("components.accounts.accountDetails.AccountInfor.title")}
        </Heading>
      </Stack>

      <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4}>
        <Box>
          <Flex direction="column" gap={3}>
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.account_name")}`,
              accountDetail.account_name,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.phone")}`,
              accountDetail.phone_number ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.company_name")}`,
              accountDetail.company_code ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.tax_code")}`,
              accountDetail.tax_code ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.representative")}`,
              accountDetail.representative ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.representative_email")}`,
              accountDetail.representative_email ?? undefined,
              false,
            )}
          </Flex>
        </Box>

        <Box>
          <Flex direction="column" gap={3}>
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.address")}`,
              accountDetail.address ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.email")}`,
              accountDetail.email,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.account_manager_named")}`,
              accountDetail?.account_manager_name ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.post_code")}`,
              accountDetail.postcode ?? undefined,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.representative_phone")}`,
              accountDetail.representative_phone ?? undefined,
              false,
            )}
            {renderField(
              `${t("components.accounts.accountDetails.AccountInfor.receive_invoice_email")}`,
              accountDetail.receive_invoice_email ?? undefined,
              false,
            )}
          </Flex>
        </Box>
      </Grid>

      <Box mt={4}>
        <Field
          label={`${t("components.accounts.accountDetails.AccountInfor.description")}`}
        >
          <Input
            value={accountDetail.description ?? ""}
            readOnly
            css={{ ...inputStyles }}
            minWidth={"100%"}
            pr="0"
          />
        </Field>
      </Box>
    </Box>
  )
}

export default AccountInfor
