import {
  type AccountPublic,
  type AccountUpdate,
  AccountsService,
  EmployeesService,
} from "@/client"
import AlertModal from "@/components/common/AlertModal"
import BoxWrapper from "@/components/common/inputs/BoxWrapper"
import InputSelect from "@/components/common/inputs/InputSelect"
import TextAreaField from "@/components/common/inputs/TextAreaField"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import { RolesEnum } from "@/types/common"
import { Box, Button, Flex } from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IoCloseSharp } from "react-icons/io5"
import { useDebounce } from "use-debounce"
import InputField from "../../common/inputs/InputField"
import InputPhoneNumber from "../../common/inputs/InputPhoneNumber"

const AccountFormUpdate = ({
  data,
  isOpen,
  setIsOpen,
}: {
  data: AccountPublic
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  const { showError, showSuccess } = useCustomToast()
  const buttonColor = useColorModeValue("blue.700", "blue.700")
  const headingColor = useColorModeValue("gray.800", "gray.300")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.900")

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["employees", debouncedSearch],
    queryFn: () =>
      EmployeesService.getAllEmployees({
        search: debouncedSearch,
        roleName: RolesEnum.ACCOUNT_MANAGER.toLowerCase(),
      }),
    select: (data) =>
      data?.data.map((item: any) => ({
        value: item.id,
        label: `${item.name}`,
      })),
  })

  const handleResetForm = () => {
    reset(data as AccountUpdate)
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleUpdateAccount = useMutation({
    mutationFn: (values: AccountUpdate) => {
      return AccountsService.updateAccount({
        id: data.id,
        requestBody: values,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })
      showSuccess(
        `${t("components.accounts.forms.AccountFormUpdate.successMessage")}`,
      )
      setIsOpen(false)
    },
    onError: (error) => {
      const { body } = error as any
      showError(body.detail)
    },
  })

  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountUpdate>({
    mode: "onChange",
    defaultValues: {
      ...data,
      created_at: data.created_at ?? undefined,
      updated_at: data.updated_at ?? undefined,
    },
  })

  const watchAccountManagerId = watch("account_manager_id")

  useEffect(() => {
    if (!watchAccountManagerId) {
      setValue("account_manager_name", "")
      return
    }

    const fetchEmployeeData = async () => {
      try {
        const employeeData = await EmployeesService.getEmployee({
          id: watchAccountManagerId,
        })

        if (employeeData) setValue("account_manager_name", employeeData.name)
      } catch (error) {
        setValue("account_manager_name", "")
      }
    }

    fetchEmployeeData()
  }, [watchAccountManagerId, setValue])

  const onSubmit: SubmitHandler<AccountUpdate> = (values) => {
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
    handleUpdateAccount.mutate(filteredData)
  }

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        created_at: data.created_at ?? undefined,
        updated_at: data.updated_at ?? undefined,
      })
    }
  }, [data, reset])

  return (
    <>
      <DialogRoot
        size={"xl"}
        placement="center"
        motionPreset="slide-in-bottom"
        closeOnInteractOutside={false}
        open={isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen.open) {
            handleResetForm()
          }
          setIsOpen(isOpen.open)
        }}
      >
        <DialogContent position={"relative"}>
          <DialogHeader p={5} pb={0}>
            <DialogTitle
              fontWeight="semibold"
              fontSize={"xl"}
              color={headingColor}
              display={"flex"}
              justifyContent={"center"}
              textTransform={"uppercase"}
              mb={4}
            >
              {t("components.accounts.forms.AccountFormUpdate.title")}
            </DialogTitle>
            <Box position={"absolute"} top={4} right={4}>
              <AlertModal
                onClick={() => {
                  setIsOpen(false)
                  reset({
                    ...data,
                    created_at: data.created_at ?? undefined,
                    updated_at: data.updated_at ?? undefined,
                  })
                }}
                triggerButton={<IoCloseSharp cursor={"pointer"} size={24} />}
                title={t(
                  "components.accounts.forms.AccountFormUpdate.closeModalTitle",
                )}
                bodyFirstLine={t(
                  "components.accounts.forms.AccountFormUpdate.closeModalBodyFirstLine",
                )}
                bodySecondLine={t(
                  "components.accounts.forms.AccountFormUpdate.closeModalBodySecondLine",
                )}
                buttonContent={t(
                  "components.accounts.forms.AccountFormUpdate.closeModalLeaveButton",
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
                    control={control}
                    id="phone_number"
                    label="Phone Number"
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
                    label="Company Code"
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
                  <InputSelect
                    defaultOption={{
                      value: data.account_manager_id,
                      label: data?.account_manager_name || "",
                    }}
                    label="Account Manager Name"
                    id="account_manager_id"
                    isRequired={true}
                    control={control}
                    options={options}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                  />
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
                    control={control}
                    id="representative_phone"
                    label="Representative Phone"
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
                    placeholder="Contain letters, numbers, special characters"
                    rules={{
                      pattern: {
                        value:
                          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                        message: "Email is not valid",
                      },
                    }}
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
                    "components.accounts.forms.AccountFormUpdate.submitModalTitle",
                  )}
                  bodyFirstLine={t(
                    "components.accounts.forms.AccountFormUpdate.submitModalBodyFirstLine",
                  )}
                  bodySecondLine={t(
                    "components.accounts.forms.AccountFormUpdate.submitModalBodySecondLine",
                  )}
                  buttonContent={t(
                    "components.accounts.forms.AccountFormUpdate.submitModalConfirmButton",
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
                        "components.accounts.forms.AccountFormUpdate.buttonSubmitTitle",
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

export default AccountFormUpdate
