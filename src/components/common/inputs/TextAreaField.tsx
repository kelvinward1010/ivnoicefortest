import { Field } from "@/components/ui/field"
import { Text, Textarea } from "@chakra-ui/react"
import type { RegisterOptions, UseFormRegister } from "react-hook-form"
interface Props {
  register: UseFormRegister<any>
  rules?: RegisterOptions
  errors: any
  label: string
  isRequired?: boolean
  value: string
  placeholder?: string
  disabled?: boolean
  defaultValue?: string
}

const TextAreaField = ({
  register,
  rules,
  errors,
  label,
  isRequired = false,
  value,
  placeholder,
  disabled = false,
  defaultValue,
}: Props) => {
  return (
    <Field
      label={label}
      helperText="Max length 255 characters."
      required={isRequired}
    >
      <Textarea
        disabled={disabled}
        defaultValue={defaultValue}
        {...register(value, {
          required: isRequired ? `${label} is required` : undefined,
          maxLength: {
            value: 255,
            message: `${label} must be less than 255 characters`,
          },
          ...rules,
        })}
        placeholder={placeholder}
        variant="outline"
        outline={"none"}
        maxH={"90px"}
        autoresize
        _focus={{ borderColor: "blue.400" }}
      />
      <Text textStyle={"xs"} color={"red.600"}>
        {errors[value]?.message}
      </Text>
    </Field>
  )
}

export default TextAreaField
