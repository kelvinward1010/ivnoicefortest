import {
  EmployeesService,
  type ProjectPublic,
  type ProjectUpdate,
  ProjectsService,
} from "@/client"
import AlertModal from "@/components/common/AlertModal"
import BoxWrapper from "@/components/common/inputs/BoxWrapper"
import InputField from "@/components/common/inputs/InputField"
import InputPhoneNumber from "@/components/common/inputs/InputPhoneNumber"
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
import { Field } from "@/components/ui/field"
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { listCurrencyCode, listStatus, statusRules } from "@/constants/project"
import useCustomToast from "@/hooks/useCustomToast"
import { RolesEnum } from "@/types/common"
import { ProjectStatusEnum } from "@/types/project"
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IoCloseSharp } from "react-icons/io5"
import { useDebounce } from "use-debounce"

interface OptionType {
  value: string
  label: string
}

interface ProjectFormUpdateProps {
  data: ProjectPublic
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}
const ProjectFormUpdate = ({
  data,
  isOpen,
  setIsOpen,
}: ProjectFormUpdateProps) => {
  const { id, account_name, ...projectData } = data
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null)

  const [isDone, setIsDone] = useState(false)
  const [searchPM, setSearchPM] = useState<string | null>(null)
  const [searchRMO, setSearchRMO] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [debouncedSearchPM] = useDebounce(searchPM, 500)
  const [debouncedSearchRMO] = useDebounce(searchRMO, 500)
  const [defaultOptionPM, setDefaultOptionPM] = useState<OptionType | null>(
    null,
  )
  const [defaultOptionRMO, setDefaultOptionRMO] = useState<OptionType | null>(
    null,
  )

  const { showError, showSuccess } = useCustomToast()
  const [listVisibleStatus, setListVisibleStatus] = useState<
    ProjectStatusEnum[]
  >([])

  const buttonColor = useColorModeValue("blue.700", "blue.700")
  const buttontextColor = useColorModeValue("gray.100", "white")
  const headingColor = useColorModeValue("gray.800", "gray.300")
  const buttonHoverColor = useColorModeValue("blue.800", "blue.800")

  const handleUpdateProject = useMutation({
    mutationFn: (values: ProjectUpdate) => {
      return ProjectsService.updateProject({
        projectId: data.id,
        requestBody: values,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      })
      showSuccess(
        t("components.projects.forms.ProjectFormUpdate.successMessage"),
      )
      setIsOpen(false)
      setIsRunning(false)
      setIsDone(false)
      handleResetForm()
    },
    onError: (errors) => {
      const { body } = errors as any
      showError(body.detail)
    },
  })

  const { data: employeePM } = useQuery({
    queryKey: ["employeesPM", data.pm_id],
    queryFn: () => {
      return EmployeesService.getEmployee({
        id: data.pm_id || "",
      })
    },
    refetchOnMount: false,
  })

  const { data: employeeRMO } = useQuery({
    queryKey: ["employeeRMO", data.rmo_id],
    queryFn: () => {
      return EmployeesService.getEmployee({
        id: data.pm_id || "",
      })
    },
    refetchOnMount: false,
  })
  const { data: optionsPM = [], isLoading: isLoadingPM } = useQuery({
    queryKey: ["employeesPM", debouncedSearchPM],
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
  })

  const { data: optionsRMO = [], isLoading: isLoadingRMO } = useQuery({
    queryKey: ["employeesRMO", debouncedSearchRMO],
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
  })

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProjectUpdate>({
    defaultValues: {
      ...projectData,
      start_date: projectData.start_date
        ? new Date(projectData.start_date).toISOString().split("T")[0]
        : "",
      end_date: projectData.end_date
        ? new Date(projectData.end_date).toISOString().split("T")[0]
        : "",
    } as ProjectUpdate,
  })

  const filterNullValue = (values: ProjectUpdate) => {
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
    return filteredData
  }

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

  const onSubmit: SubmitHandler<ProjectUpdate> = (values) => {
    const filteredData = filterNullValue(values)
    if (filteredData.working_hours)
      filteredData.working_hours = filteredData.working_hours
        .toString()
        .replace(",", ".")
    if (filteredData.project_budget)
      filteredData.project_budget = Number(
        filteredData.project_budget.toString().replace(",", "."),
      )
    filteredData.status = Array.isArray(filteredData.status)
      ? filteredData.status[0]
      : filteredData.status
    handleUpdateProject.mutate(filteredData as ProjectUpdate)
  }

  const handleResetForm = () => {
    reset(projectData as ProjectUpdate)
    setIsDone(false)
    setIsRunning(false)
  }

  const handleStatusChange = (selected: any) => {
    const newStatus = selected?.value
    setValue("status", newStatus[0])
    setIsRunning(false)
    setIsDone(false)

    if (newStatus[0] === ProjectStatusEnum.RUNNING) {
      setIsRunning(true)
    }

    if (newStatus[0] === ProjectStatusEnum.DONE) {
      setIsDone(true)
    }
  }

  useEffect(() => {
    const statusValue = data.status as ProjectStatusEnum
    if (statusValue) {
      if (statusValue === ProjectStatusEnum.RUNNING) setIsRunning(true)
      if (statusValue === ProjectStatusEnum.DONE) setIsDone(true)
      setListVisibleStatus(statusRules[statusValue])
    }
  }, [data.status])

  useEffect(() => {
    if (employeePM)
      setDefaultOptionPM({
        value: employeePM.id,
        label: `${employeePM.name}`,
      })
  }, [employeePM])

  useEffect(() => {
    if (employeeRMO)
      setDefaultOptionRMO({
        value: employeeRMO.id,
        label: `${employeeRMO.name}`,
      })
  }, [employeeRMO])

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
        <DialogContent ref={contentRef}>
          <DialogHeader p={5} pb={0}>
            <DialogTitle
              fontWeight="semibold"
              fontSize={"xl"}
              color={headingColor}
              mb={4}
              mt={2}
              display={"flex"}
              justifyContent={"center"}
              textTransform={"uppercase"}
            >
              {t("components.projects.forms.ProjectFormUpdate.title")}
            </DialogTitle>
            <Box position={"absolute"} top={4} right={4}>
              <AlertModal
                onClick={() => {
                  setIsOpen(false)
                  handleResetForm()
                }}
                title={t(
                  "components.projects.forms.ProjectFormUpdate.closeModalTitle",
                )}
                bodyFirstLine={t(
                  "components.projects.forms.ProjectFormUpdate.closeModalBodyFirstLine",
                )}
                bodySecondLine={t(
                  "components.projects.forms.ProjectFormUpdate.closeModalBodySecondLine",
                )}
                buttonContent={t(
                  "components.projects.forms.ProjectFormUpdate.closeModalLeaveButton",
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
                  <Field label="Account Name" required flex={1}>
                    <Input defaultValue={data.account_name ?? ""} disabled />
                  </Field>
                </BoxWrapper>
                <Flex
                  w={"full"}
                  gap={10}
                  mb={7}
                  h={"65px"}
                  justifyContent={"space-between"}
                >
                  <InputSelect
                    options={optionsPM}
                    control={control}
                    label="PM Name"
                    id="pm_id"
                    isLoading={isLoadingPM}
                    defaultOption={defaultOptionPM}
                    isRequired={isRunning || isDone}
                    onInputChange={(value: string) => setSearchPM(value)}
                  />
                  <InputSelect
                    options={optionsRMO}
                    control={control}
                    label="RMO Name"
                    id="rmo_id"
                    isLoading={isLoadingRMO}
                    isRequired={isRunning || isDone}
                    defaultOption={defaultOptionRMO}
                    onInputChange={(value: string) => setSearchRMO(value)}
                  />
                </Flex>
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
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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
                    isRequired={isRunning || isDone}
                    errors={errors}
                    label="Start Date"
                    value={"start_date"}
                    inputType="date"
                    placeholder="Pick date"
                  />
                  <InputField
                    register={register}
                    isRequired={isRunning || isDone}
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
                    isRequired={isRunning || isDone}
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
                      isRequired={isRunning || isDone}
                      label="Project Budget"
                      value={"project_budget"}
                      placeholder="Contain numbers"
                      rules={{
                        pattern: {
                          value: /^(?!0+(?:[.,]0+)?$)\d+([.,]\d+)?$/,
                          message: "Please enter a valid number greater than 0",
                        },
                      }}
                    />{" "}
                    <SelectRoot
                      w={"fit-content"}
                      minW={"120px"}
                      required={isRunning || isDone}
                      collection={listCurrencyCode}
                      defaultValue={[
                        listCurrencyCode.items.find(
                          (item) => item.value === data.currency_code,
                        )?.value || "",
                      ]}
                      {...register("currency_code")}
                    >
                      <SelectLabel>
                        <Flex fontSize={"sm"} gap={"3px"}>
                          <Text>Currency Code</Text>
                          {(isRunning || isDone) && (
                            <Text color={"red.400"}>*</Text>
                          )}
                        </Flex>
                      </SelectLabel>
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
                    isRequired={isRunning || isDone}
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
                    onValueChange={handleStatusChange}
                    defaultValue={[
                      listStatus.items.find(
                        (item) => item.value === data.status,
                      )?.value || listStatus.items[0].value,
                    ]}
                    position={"relative"}
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
                          pointerEvents={
                            !listVisibleStatus.includes(item.value)
                              ? "none"
                              : "unset"
                          }
                          opacity={
                            !listVisibleStatus.includes(item.value)
                              ? "50%"
                              : "100%"
                          }
                          cursor={"pointer"}
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
                    "components.projects.forms.ProjectFormUpdate.submitModalTitle",
                  )}
                  bodyFirstLine={t(
                    "components.projects.forms.ProjectFormUpdate.submitModalBodyFirstLine",
                  )}
                  bodySecondLine={t(
                    "components.projects.forms.ProjectFormUpdate.submitModalBodySecondLine",
                  )}
                  buttonContent={t(
                    "components.projects.forms.ProjectFormUpdate.submitModalConfirmButton",
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
                        "components.projects.forms.ProjectFormUpdate.buttonSubmitTitle",
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
export default ProjectFormUpdate
