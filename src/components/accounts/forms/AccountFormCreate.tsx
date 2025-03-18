import {
  type AccountCreate,
  type AccountPublic,
  AccountsService,
  EmployeesService,
} from "@/client"
import AlertModal from "@/components/common/AlertModal"
import BoxWrapper from "@/components/common/inputs/BoxWrapper"
import TextAreaField from "@/components/common/inputs/TextAreaField"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import { useCreateAccountFolder } from "@/services/drives"
import { RolesEnum } from "@/types/common"
import { Box, Button, Flex } from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { GoPlus } from "react-icons/go"
import { IoCloseSharp } from "react-icons/io5"
import { useDebounce } from "use-debounce"
import InputField from "../../common/inputs/InputField"
import InputPhoneNumber from "../../common/inputs/InputPhoneNumber"
import InputSelect from "../../common/inputs/InputSelect"

const AccountFormCreate = () => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [open, setOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  const { showError, showSuccess } = useCustomToast()

  const buttonColor = useColorModeValue("blue.700", "blue.600")
  const headingColor = useColorModeValue("gray.800", "gray.300")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.700")

  const createAccountFolder = useCreateAccountFolder()

  const handleCreateAccount = useMutation({
    mutationFn: (values: AccountCreate) => {
      return AccountsService.createAccount({
        requestBody: {
          ...values,
          created_by_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        },
      })
    },
    onSuccess: async (data: AccountPublic) => {
      await createAccountFolder.mutate({
        accountId: data?.id,
        accountName: data?.account_name,
      })
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })
      showSuccess(
        `${t("components.accounts.forms.AccountFormCreate.successMessage")}`,
      )
      handleResetForm()
      setOpen(false)
    },
    onError: (error) => {
      const { body, status } = error as any
      if (status === 400) {
        if (body?.detail?.includes("Email")) {
          showError(
            `${t("components.accounts.forms.AccountFormCreate.errorMessageForExistingEmail")}`,
          )
        } else if (body?.detail?.includes("Company Code")) {
          showError("This Account Code is already in use")
        } else if (body?.detail?.includes("Tax Code")) {
          showError("This Tax Code is already in use")
        } else {
          showError(body.detail || "An unexpected error occurred.")
        }
      } else {
        showError(body.detail || "An unexpected error occurred.")
      }
    },
  })

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["employees", debouncedSearch],
    queryFn: () =>
      EmployeesService.getAllEmployees({
        search: debouncedSearch,
        roleName: RolesEnum.ACCOUNT_MANAGER.toLowerCase(),
      }),
    enabled: searchTerm.length >= 2,
    select: (data) =>
      data?.data.map((item: any) => ({
        value: item.id,
        label: `${item.name}`,
      })),
  })

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
  }
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountCreate>({ mode: "onChange" })

  const watchAccountManagerId = watch("account_manager_id")

  const { data: employee } = useQuery({
    queryKey: ["employees", watchAccountManagerId],
    queryFn: () => {
      return EmployeesService.getEmployee({
        id: watchAccountManagerId,
      })
    },
    refetchOnMount: false,
    enabled: !!watchAccountManagerId,
  })
  useEffect(() => {
    if (employee?.name) {
      setValue("account_manager_name", employee.name)
    }
  }, [employee, setValue])

  const onSubmit: SubmitHandler<AccountCreate> = (values) => {
    const filteredData = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ])
        .filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined,
        ),
    )
    handleCreateAccount.mutate(filteredData)
  }

  const handleResetForm = () => {
    reset({
      account_name: "",
      address: "",
      phone_number: "",
      email: "",
      company_code: "",
      postcode: "",
      tax_code: "",
      account_manager_id: "",
      representative: "",
      representative_phone: "",
      representative_email: "",
      description: "",
      receive_invoice_email: "",
    })
  }

  return (
    <>
      <DialogRoot
        size={"xl"}
        placement="center"
        motionPreset="slide-in-bottom"
        closeOnInteractOutside={false}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen.open) {
            handleResetForm()
          }
          setOpen(isOpen.open)
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            rounded={"lg"}
            bg={buttonColor}
            _hover={{ bg: buttonHoverColor }}
            color={buttontextColor}
          >
            <GoPlus />
            {t("components.accounts.forms.AccountFormCreate.buttonTitle")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader p={5} pb={0}>
            <DialogTitle
              fontWeight="semibold"
              fontSize={"xl"}
              mb={4}
              color={headingColor}
              display={"flex"}
              justifyContent={"center"}
              textTransform={"uppercase"}
            >
              {t("components.accounts.forms.AccountFormCreate.title")}
            </DialogTitle>
            <Box position={"absolute"} top={4} right={4}>
              <AlertModal
                onClick={() => {
                  setOpen(false)
                  handleResetForm()
                }}
                triggerButton={<IoCloseSharp cursor={"pointer"} size={24} />}
                title={t(
                  "components.accounts.forms.AccountFormCreate.closeModalTitle",
                )}
                bodyFirstLine={t(
                  "components.accounts.forms.AccountFormCreate.closeModalBodyFirstLine",
                )}
                bodySecondLine={t(
                  "components.accounts.forms.AccountFormCreate.closeModalBodySecondLine",
                )}
                buttonContent={t(
                  "components.accounts.forms.AccountFormCreate.closeModalLeaveButton",
                )}
                buttonColorPalette="red"
              />
            </Box>
          </DialogHeader>

          <DialogBody p={5}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ minWidth: "100px" }}
            >
              <Flex
                flexDirection={"column"}
                alignItems={"start"}
                w={"full"}
                overflowY={"scroll"}
                py={2}
                rounded={"xl"}
                maxH={"65vh"}
                px={8}
                css={{ "--field-label-width": "120px" }}
              >
                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Account Name"
                    isRequired={true}
                    value={"account_name"}
                    placeholder="Contain letters and numbers"
                    rules={{
                      pattern: {
                        value: /^[a-zA-ZÀ-ỹ0-9\s]+$/,
                        message: "Only contain letters and numbers",
                      },
                    }}
                  />
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Address"
                    isRequired={true}
                    value={"address"}
                    placeholder="Contain letters, number, special characters"
                  />
                </BoxWrapper>
                <BoxWrapper>
                  <InputPhoneNumber
                    id="phone_number"
                    label="Phone Number"
                    control={control}
                    isRequired={true}
                  />
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Email"
                    isRequired={true}
                    inputType="email"
                    value={"email"}
                    placeholder="Contain letters, number, special characters "
                    rules={{
                      pattern: {
                        value:
                          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                        message: "Email is not valid",
                      },
                    }}
                  />
                </BoxWrapper>
                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Account Code"
                    isRequired={true}
                    value={"company_code"}
                    placeholder="Contain letters and numbers"
                    rules={{
                      pattern: {
                        value: /^[a-zA-Z0-9]+$/,
                        message: "Only contain letters and numbers",
                      },
                    }}
                  />
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Postcode"
                    isRequired={true}
                    value={"postcode"}
                    placeholder="Only contain numbers"
                    rules={{
                      pattern: {
                        value: /^\d+$/,
                        message: "Only contain numbers",
                      },
                    }}
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <Box flex={1} w={"full"}>
                    <InputField
                      register={register}
                      errors={errors}
                      direction="vertical"
                      label="Tax Code"
                      isRequired={true}
                      value={"tax_code"}
                      placeholder="Contain letters and numbers"
                      rules={{
                        pattern: {
                          value: /^[a-zA-Z0-9]+$/,
                          message: "Only contain letters and numbers",
                        },
                      }}
                    />
                  </Box>

                  <Box maxW={"368px"} w={"full"} flex={1}>
                    <InputSelect
                      label="Account Manager Name"
                      id="account_manager_id"
                      isRequired={true}
                      control={control}
                      options={options}
                      isLoading={isLoading}
                      onInputChange={handleInputChange}
                    />
                  </Box>
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Representative"
                    isRequired={true}
                    value={"representative"}
                    placeholder="Only contain letters"
                    rules={{
                      pattern: {
                        value: /^[a-zA-ZÀ-ỹ\s]+$/,
                        message: "Only contain letters",
                      },
                    }}
                  />
                  <InputPhoneNumber
                    id="representative_phone"
                    label="Representative Phone"
                    control={control}
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Representative Email"
                    isRequired={false}
                    inputType="email"
                    value={"representative_email"}
                    placeholder="Contain numbers and special characters"
                    rules={{
                      pattern: {
                        value:
                          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                        message: "Email is not valid",
                      },
                    }}
                  />

                  <InputField
                    register={register}
                    errors={errors}
                    direction="vertical"
                    label="Receive Invoice Email"
                    isRequired={false}
                    inputType="email"
                    value={"receive_invoice_email"}
                    rules={{
                      pattern: {
                        value:
                          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                        message: "Email is not valid",
                      },
                    }}
                    placeholder="Contain letters, numbers, special characters"
                  />
                </BoxWrapper>
                <TextAreaField
                  errors={errors}
                  label="Description"
                  value="description"
                  register={register}
                  placeholder="Start typing..."
                />
              </Flex>
              <Box float={"right"}>
                <AlertModal
                  onClick={() => handleSubmit(onSubmit)()}
                  title={t(
                    "components.accounts.forms.AccountFormCreate.submitModalTitle",
                  )}
                  bodyFirstLine={t(
                    "components.accounts.forms.AccountFormCreate.submitModalBodyFirstLine",
                  )}
                  bodySecondLine={t(
                    "components.accounts.forms.AccountFormCreate.submitModalBodySecondLine",
                  )}
                  buttonContent={t(
                    "components.accounts.forms.AccountFormCreate.submitModalConfirmButton",
                  )}
                  triggerButton={
                    <Button
                      mt={8}
                      px={8}
                      py={2}
                      background={buttonColor}
                      _hover={{ background: buttonHoverColor }}
                      color={buttontextColor}
                      fontWeight={"semibold"}
                      cursor={"pointer"}
                    >
                      {t(
                        "components.accounts.forms.AccountFormCreate.buttonSubmitTitle",
                      )}
                    </Button>
                  }
                />
              </Box>
            </form>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default AccountFormCreate
