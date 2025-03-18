import { Box, Flex, Text } from "@chakra-ui/react"
import { useTheme } from "next-themes"
import { type Control, Controller } from "react-hook-form"
import Select, { type SingleValue, type MultiValue } from "react-select"

interface OptionType {
  value: string
  label: string
}

interface InputSelectProps {
  control: Control<any>
  options: OptionType[]
  isLoading: boolean
  isRequired?: boolean
  label: string
  onInputChange?: (value: string) => void
  id: string
  defaultOption?: OptionType | null
  isMuti?: boolean
}

const InputSelect = ({
  control,
  options,
  isLoading,
  onInputChange,
  isRequired = false,
  label,
  id,
  defaultOption,
  isMuti = false,
}: InputSelectProps) => {
  const { theme } = useTheme()

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      boxShadow: "none",
      width: "full",
      borderColor: state.isFocused ? "#60a5fa" : "gray.300",
      backgroundColor: theme === "dark" ? "dark" : "white",
      color: theme === "dark" ? "white" : "black",
      height: "40px",
      transition: "border-color 0.3s ease-in-out",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      color: state.isSelected ? "white" : "black",
      backgroundColor: state.isSelected ? "#60a5fa" : "white",
    }),
    input: (provided: any) => ({
      ...provided,
      color: theme === "light" ? "black" : "white",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: theme === "light" ? "black" : "white",
    }),
  }

  return (
    <Box maxWidth={"380px"} width={"full"} flex={1}>
      <Flex fontSize={"sm"} gap={"3px"} mb={"5px"}>
        <Text>{label}</Text>
        {isRequired && <Text color={"red.400"}>*</Text>}
      </Flex>
      <Controller
        name={id}
        control={control}
        rules={{ required: isRequired ? `${label} is required` : undefined }}
        render={({
          field: { onChange, value, ref },
          fieldState: { error },
        }) => {
          return (
            <>
              <Select
                defaultValue={defaultOption}
                ref={ref}
                value={options.find((option) => option.value === value)}
                onChange={(selectedOption) => {
                  if (Array.isArray(selectedOption)) {
                    onChange(
                      (selectedOption as MultiValue<OptionType>).map(
                        (option) => option.value,
                      ),
                    )
                  } else {
                    onChange(
                      (selectedOption as SingleValue<OptionType>)?.value || "",
                    )
                  }
                }}
                required={true}
                isClearable
                isMulti={isMuti}
                options={options}
                placeholder={label}
                isLoading={isLoading}
                styles={customStyles}
                onInputChange={onInputChange}
              />
              {
                <Text mt={"4px"} fontSize={"12px"} color={"red.600"}>
                  {error?.message}
                </Text>
              }
            </>
          )
        }}
      />
    </Box>
  )
}

export default InputSelect
