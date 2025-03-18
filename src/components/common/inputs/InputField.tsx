import { Field } from "@/components/ui/field"
import { Input, Text } from "@chakra-ui/react"
import type { RegisterOptions, UseFormRegister } from "react-hook-form"

interface InputFieldType {
  register: UseFormRegister<any>
  rules?: RegisterOptions
  errors: any
  inputType?: string
  direction?: "vertical" | "horizontal"
  label: string
  isRequired?: boolean
  value: string
  placeholder: string
  disabled?: boolean
  defaultValue?: string
}

const InputField: React.FC<InputFieldType> = ({
  register,
  rules,
  errors,
  inputType = "text",
  direction = "vertical",
  label,
  isRequired = false,
  value,
  placeholder = "",
  disabled = false,
  defaultValue,
}) => {
  return (
    <Field
      defaultValue={defaultValue}
      orientation={direction}
      label={label}
      required={isRequired}
      minH={"95px"}
      outline={"none"}
      flex={1}
    >
      <Input
        disabled={disabled}
        ring={0}
        outline={"none"}
        _focus={{ borderColor: "blue.400" }}
        placeholder={placeholder}
        type={inputType}
        {...register(value, {
          setValueAs: (val) =>
            typeof val === "string" ? val.trim().replace(/\s+/g, " ") : val,
          required: isRequired ? `${label} is required` : undefined,
          maxLength: {
            value: 255,
            message: `${label} must be less than 255 characters`,
          },
          ...rules,
        })}
      />
      <Text fontSize={"12px"} color={"red.600"}>
        {errors[value]?.message}
      </Text>
    </Field>
  )
}

export default InputField
