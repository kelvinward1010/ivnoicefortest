import { Field } from "@/components/ui/field"
import { Text } from "@chakra-ui/react"
import { type Control, Controller } from "react-hook-form"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { useTheme } from "next-themes"
import { useState } from "react"

interface InputPhoneNumberProps {
  id: string
  label: string
  isRequired?: boolean
  control: Control<any>
  onChange?: (data: {
    countryCode: string
    phoneNumber: string
    formattedNumber: string
  }) => void
}

const InputPhoneNumber = ({
  id,
  label,
  isRequired = false,
  control,
  onChange: onExternalChange,
}: InputPhoneNumberProps) => {
  const { theme } = useTheme()
  const [isFocus, setIsFocus] = useState(false)

  const handlePhoneChange = (
    value: string,
    country: any,
    onChange: (value: string) => void,
  ) => {
    try {
      const countryCode = `+${country.dialCode}`
      const phoneNumber = value.substring(country.dialCode.length)

      const parsedNumber = parsePhoneNumberFromString(
        `${countryCode}${phoneNumber}`,
        country.countryCode,
      )

      const formattedNumber = parsedNumber
        ? parsedNumber.formatInternational()
        : `${countryCode}${phoneNumber}`

      onChange(formattedNumber)

      if (onExternalChange) {
        onExternalChange({
          countryCode,
          phoneNumber,
          formattedNumber,
        })
      }
    } catch (error) {
      onChange(`+${value}`)
      if (onExternalChange) {
        onExternalChange({
          countryCode: `+${country.dialCode}`,
          phoneNumber: value.substring(country.dialCode.length),
          formattedNumber: `+${value}`,
        })
      }
    }
  }

  const parseFormattedValue = (formattedValue: string) => {
    if (!formattedValue) return ""
    return formattedValue.replace(/[^0-9]/g, "")
  }

  return (
    <Field label={label} required={isRequired} minH={"95px"} flex={1}>
      <Controller
        name={id}
        control={control}
        rules={{
          required: isRequired ? "Phone number is required" : false,
          validate: (value) => {
            if (!value) return true
            const rawValue = parseFormattedValue(value)
            if (rawValue.length < 4) return "Phone number is too short"
            if (rawValue.length > 15) return "Phone number is too long"
            return true
          },
        }}
        render={({
          field: { onChange, value, ref },
          fieldState: { error },
        }) => (
          <>
            <PhoneInput
              inputProps={{
                ref,
                required: isRequired,
                autoFocus: isFocus,
              }}
              country={"vn"}
              value={parseFormattedValue(value)}
              onChange={(value, country) =>
                handlePhoneChange(value, country, onChange)
              }
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                border: `1px solid ${
                  isFocus
                    ? "#60a5fa"
                    : theme === "light"
                      ? "#e4e4e7"
                      : "#27272a"
                }`,
                background: theme === "light" ? "white" : "rgb(17 17 17 / 0%)",
                borderRadius: "5px",
                paddingTop: "19px",
                paddingBottom: "19px",
                paddingLeft: "50px",
                transition: "border 0.3s ease-in-out",
              }}
              buttonStyle={{
                color: "black",
                border: `1px solid ${
                  isFocus
                    ? "#60a5fa"
                    : theme === "light"
                      ? "#e4e4e7"
                      : "#27272a"
                }`,
              }}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
            />
            {error && (
              <Text fontSize="12px" color="red.600">
                {error.message}
              </Text>
            )}
          </>
        )}
      />
    </Field>
  )
}

export default InputPhoneNumber
