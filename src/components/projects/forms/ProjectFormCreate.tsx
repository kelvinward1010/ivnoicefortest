import { GoPlus } from "react-icons/go"
import "react-phone-input-2/lib/style.css"
import {
  AccountsService,
  EmployeesService,
  type ProjectCreate,
  type ProjectPublic,
  ProjectsService,
} from "@/client"
import AlertModal from "@/components/common/AlertModal"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { listCurrencyCode, listStatus } from "@/constants/project"
import useCustomToast from "@/hooks/useCustomToast"
import { CurrencyCodeEnum, RolesEnum } from "@/types/common"
import { Avatar, Box, Button, Flex, HStack, Text } from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IoCloseSharp } from "react-icons/io5"
import { ProjectStatusEnum } from "../../../types/project"

import BoxWrapper from "@/components/common/inputs/BoxWrapper"
import InputField from "@/components/common/inputs/InputField"
import InputPhoneNumber from "@/components/common/inputs/InputPhoneNumber"
import InputSelect from "@/components/common/inputs/InputSelect"
import TextAreaField from "@/components/common/inputs/TextAreaField"
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { useCreateProjectFolder } from "@/services/drives"
import { useDebounce } from "use-debounce"

const ProjectFormCreate = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { showSuccess, showError } = useCustomToast()

  const [searchPM, setSearchPM] = useState<string | null>(null)
  const [searchRMO, setSearchRMO] = useState<string | null>(null)
  const [searchAccount, setSearchAccount] = useState<string | null>(null)

  const [debouncedSearchPM] = useDebounce(searchPM, 500)
  const [debouncedSearchRMO] = useDebounce(searchRMO, 500)
  const [debouncedSearchAccount] = useDebounce(searchAccount, 500)

  const buttonColor = useColorModeValue("blue.700", "blue.700")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const headingColor = useColorModeValue("gray.800", "gray.300")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.800")

  const createFolderProject = useCreateProjectFolder()

  const handleCreateProject = useMutation({
    mutationFn: (values: ProjectCreate) => {
      return ProjectsService.createProject({
        requestBody: values,
      })
    },
    onSuccess: async (data: ProjectPublic) => {
      await createFolderProject.mutate({
        name: data.name,
        projectId: data.id,
        accountId: data.account_id as string,
      })
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      })
      showSuccess(
        `${t("components.projects.forms.ProjectFormCreate.successMessage")}`,
      )
      setOpen(false)
      handleResetForm()
    },
    onError: (error) => {
      const { body, status } = error as any
      if (status === 400) {
        showError(`${body.detail}`)
      } else showError("Something went wrong!")
    },
  })

  const { data: optionsPM = [], isLoading: isLoadingPM } = useQuery({
    queryKey: debouncedSearchPM
      ? ["employeesPM", debouncedSearchPM]
      : ["employeesPM"],
    queryFn: () =>
      EmployeesService.getAllEmployees({
        search: debouncedSearchPM,
        roleName: RolesEnum.PROJECT_MANAGER.toLowerCase(),
      }),
    select: (data) =>
      data?.data.map((item: any) => ({
        value: item.id,
        label: `${item.name}`,
      })),
    enabled: !!debouncedSearchPM,
  })

  const { data: optionsRMO = [], isLoading: isLoadingRMO } = useQuery({
    queryKey: debouncedSearchRMO
      ? ["employeesRMO", debouncedSearchRMO]
      : ["employeesRMO"],
    queryFn: () =>
      EmployeesService.getAllEmployees({
        search: debouncedSearchRMO,
        roleName: RolesEnum.RELATIONSHIP_MANAGEMENT_OFFICE.toLowerCase(),
      }),
    select: (data) =>
      data?.data.map((item: any) => ({
        value: item.id,
        label: `${item.name}`,
      })),
    enabled: !!debouncedSearchRMO,
  })

  const { data: optionsAccount = [], isLoading: isLoadingAccount } = useQuery({
    queryKey: debouncedSearchAccount
      ? ["accounts", debouncedSearchAccount]
      : ["accounts"],
    queryFn: () =>
      AccountsService.getAccounts({
        search: debouncedSearchAccount,
      }),
    select: (data) =>
      data?.data.map((item: any) => ({
        value: item.id,
        label: `${item.account_name}`,
      })),
    enabled: !!debouncedSearchAccount,
  })

  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectCreate>({
    mode: "onChange",
    defaultValues: {
      status: ProjectStatusEnum.DRAFT,
      currency_code: CurrencyCodeEnum.USD,
    },
  })

  const useEmployee = (employeeId: any, fieldName: any, setValue: any) => {
    const { data: employeeData } = useQuery({
      queryKey: ["employees", employeeId],
      queryFn: () => {
        if (typeof employeeId !== "string") {
          throw new Error(`${fieldName} ID must be a string`)
        }
        return EmployeesService.getEmployee({ id: employeeId })
      },
      refetchOnMount: false,
      enabled: !!employeeId,
    })

    useEffect(() => {
      if (employeeData?.name) {
        setValue(fieldName, employeeData.name)
      }
    }, [employeeData, fieldName, setValue])

    return employeeData
  }

  const watchRMOId = watch("rmo_id")
  const watchPMId = watch("pm_id")

  useEmployee(watchRMOId, "rmo_name", setValue)
  useEmployee(watchPMId, "pm_name", setValue)

  const onSubmit: SubmitHandler<ProjectCreate> = (values) => {
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

    if (filteredData.working_hours)
      filteredData.working_hours = filteredData.working_hours
        .toString()
        .replace(",", ".")

    if (filteredData.project_budget)
      filteredData.project_budget = Number(
        filteredData.project_budget.toString().replace(",", "."),
      )

    handleCreateProject.mutate(filteredData as ProjectCreate)
  }

  const handleResetForm = () => {
    reset({
      name: "",
      account_id: "",
      pm_id: null,
      rmo_id: null,
      client_pm: null,
      client_po: null,
      client_pm_phone_number: null,
      client_pm_email: null,
      client_po_phone_number: null,
      client_po_email: null,
      start_date: null,
      end_date: null,
      description: null,
      project_size: null,
      project_budget: null,
      working_hours: null,
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
            variant="outline"
            size="sm"
            rounded={"lg"}
            mb={4}
            bg={buttonColor}
            color={buttontextColor}
            _hover={{ background: buttonHoverColor }}
          >
            <GoPlus />
            {t("components.projects.forms.ProjectFormCreate.buttonTitle")}
          </Button>
        </DialogTrigger>
        <DialogContent ref={contentRef}>
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
              {t("components.projects.forms.ProjectFormCreate.title")}
            </DialogTitle>
            <Box position={"absolute"} top={4} right={4}>
              <AlertModal
                onClick={() => {
                  setOpen(false)
                  handleResetForm()
                }}
                title={t(
                  "components.projects.forms.ProjectFormCreate.closeModalTitle",
                )}
                bodyFirstLine={t(
                  "components.projects.forms.ProjectFormCreate.closeModalBodyFirstLine",
                )}
                bodySecondLine={t(
                  "components.projects.forms.ProjectFormCreate.closeModalBodySecondLine",
                )}
                buttonContent={t(
                  "components.projects.forms.ProjectFormCreate.closeModalLeaveButton",
                )}
                triggerButton={<IoCloseSharp cursor={"pointer"} size={24} />}
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
                px={5}
                css={{ "--field-label-width": "120px" }}
              >
                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    label="Project Name"
                    isRequired={true}
                    value={"name"}
                    placeholder="Contain letters, number, special characters"
                  />
                  <InputSelect
                    options={optionsAccount}
                    isRequired={true}
                    control={control}
                    label="Account Name"
                    id="account_id"
                    isLoading={isLoadingAccount}
                    onInputChange={(value: string) => setSearchAccount(value)}
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <Flex w={"full"} gap={10} mb={7} h={"65px"}>
                    <InputSelect
                      options={optionsPM}
                      control={control}
                      label="PM Name"
                      id="pm_id"
                      isLoading={isLoadingPM}
                      onInputChange={(value: string) => setSearchPM(value)}
                    />
                    <InputSelect
                      options={optionsRMO}
                      control={control}
                      label="RMO Name"
                      id="rmo_id"
                      isLoading={isLoadingRMO}
                      onInputChange={(value: string) => setSearchRMO(value)}
                    />
                  </Flex>
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    label="Client PM Name"
                    value={"client_pm"}
                    placeholder="Only contain letters"
                    rules={{
                      pattern: {
                        value: /^[a-zA-ZÀ-ỹ\s]+$/,
                        message: "Only contain letters",
                      },
                    }}
                  />
                  <InputField
                    register={register}
                    errors={errors}
                    label="Client PO Name"
                    value={"client_po"}
                    placeholder="Only contain letters"
                    rules={{
                      pattern: {
                        value: /^[a-zA-ZÀ-ỹ\s]+$/,
                        message: "Only contain letters",
                      },
                    }}
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <InputPhoneNumber
                    control={control}
                    id="client_pm_phone_number"
                    label="Client PM Phone Number"
                  />
                  <InputPhoneNumber
                    control={control}
                    id="client_po_phone_number"
                    label="Client PO Phone Number"
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    label="Client PM Email"
                    value={"client_pm_email"}
                    inputType="email"
                    placeholder="Contain letters, numbers, special characters"
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
                    label="Client PO Email"
                    inputType="email"
                    value={"client_po_email"}
                    placeholder="Contain numbers and special characters"
                    rules={{
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Email is not valid",
                      },
                    }}
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    label="Start Date"
                    value={"start_date"}
                    inputType="date"
                    placeholder="Pick date"
                  />
                  <InputField
                    register={register}
                    errors={errors}
                    label="End Date"
                    value={"end_date"}
                    inputType="date"
                    placeholder="Pick date"
                  />
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    label="Project Size"
                    value={"project_size"}
                    placeholder="Contain numbers"
                    rules={{
                      pattern: {
                        value: /^(?!0+(?:[.,]0+)?$)\d+([.,]\d+)?$/,
                        message: "Please enter a valid number greater than 0",
                      },
                    }}
                  />

                  <Flex gap={1} flex={1}>
                    <InputField
                      register={register}
                      errors={errors}
                      label="Project Budget"
                      value={"project_budget"}
                      placeholder="Contain numbers"
                      rules={{
                        pattern: {
                          value: /^(?!0+(?:[.,]0+)?$)\d+([.,]\d+)?$/,
                          message: "Please enter a valid number greater than 0",
                        },
                      }}
                    />
                    <SelectRoot
                      w={"fit-content"}
                      minW={"120px"}
                      collection={listCurrencyCode}
                      defaultValue={[
                        listCurrencyCode.items.find(
                          (item) => item.value === CurrencyCodeEnum.USD,
                        )?.value || "",
                      ]}
                      {...register("currency_code")}
                    >
                      <SelectLabel>Currency Code</SelectLabel>
                      <SelectTrigger>
                        <SelectValueItem />
                      </SelectTrigger>
                      <SelectContent portalRef={contentRef}>
                        {listCurrencyCode.items.map((item) => (
                          <SelectItem
                            item={item}
                            key={item.value}
                            cursor={"pointer"}
                          >
                            <HStack gap={4}>
                              <Avatar.Root shape={"square"} w={8} h={6}>
                                <Avatar.Fallback />
                                <Avatar.Image src={item.avatar} />
                              </Avatar.Root>
                              <Text fontSize={"xs"} fontWeight={"semibold"}>
                                {item.label}
                              </Text>
                            </HStack>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Flex>
                </BoxWrapper>

                <BoxWrapper>
                  <InputField
                    register={register}
                    errors={errors}
                    label="Working Hours"
                    value={"working_hours"}
                    placeholder="Contain numbers"
                    rules={{
                      pattern: {
                        value: /^(?!0+(?:[.,]0+)?$)\d+([.,]\d+)?$/,
                        message: "Please enter a valid number greater than 0",
                      },
                    }}
                  />
                  <SelectRoot
                    flex={1}
                    collection={listStatus}
                    defaultValue={[listStatus.items[0].value]}
                    {...register("status")}
                  >
                    <SelectLabel>Status</SelectLabel>
                    <SelectTrigger>
                      <SelectValueText placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent portalRef={contentRef}>
                      {listStatus.items.map((item) => (
                        <SelectItem
                          item={item}
                          key={item.value}
                          cursor={"pointer"}
                          pointerEvents={
                            item.value !== ProjectStatusEnum.DRAFT
                              ? "none"
                              : "unset"
                          }
                          opacity={
                            item.value !== ProjectStatusEnum.DRAFT
                              ? "50%"
                              : "100%"
                          }
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </BoxWrapper>
                <TextAreaField
                  errors={errors}
                  label="Description"
                  register={register}
                  value="description"
                  placeholder="Start typing..."
                />
              </Flex>
              <Box float={"right"}>
                <AlertModal
                  onClick={() => handleSubmit(onSubmit)()}
                  title={t(
                    "components.projects.forms.ProjectFormCreate.submitModalTitle",
                  )}
                  bodyFirstLine={t(
                    "components.projects.forms.ProjectFormCreate.submitModalBodyFirstLine",
                  )}
                  bodySecondLine={t(
                    "components.projects.forms.ProjectFormCreate.submitModalBodySecondLine",
                  )}
                  buttonContent={t(
                    "components.projects.forms.ProjectFormCreate.submitModalConfirmButton",
                  )}
                  triggerButton={
                    <Button
                      mt={8}
                      px={8}
                      py={2}
                      cursor={"pointer"}
                      fontWeight={"semibold"}
                      color={buttontextColor}
                      background={buttonColor}
                      _hover={{ background: buttonHoverColor }}
                    >
                      {t(
                        "components.projects.forms.ProjectFormCreate.buttonSubmitTitle",
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

const SelectValueItem = () => (
  <SelectValueText placeholder="Select movie">
    {(items: Array<{ label: string; avatar: string }>) => {
      const { label, avatar } = items[0]
      return (
        <HStack>
          <Avatar.Root shape={"square"} w={8} h={6}>
            <Avatar.Fallback />
            <Avatar.Image src={avatar} />
          </Avatar.Root>
          <Text fontSize={"xs"} fontWeight={"semibold"}>
            {label}
          </Text>
        </HStack>
      )
    }}
  </SelectValueText>
)

export default ProjectFormCreate
