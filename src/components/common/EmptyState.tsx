import { Heading, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { TbFilterExclamation } from "react-icons/tb"

interface EmptyStateProps {
  title?: string
  description?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
}) => {
  const { t } = useTranslation()
  return (
    <VStack color={"ui.gray"} mt={30} textAlign="center" opacity={0.6}>
      <TbFilterExclamation size={60} />
      <Heading size="md">
        {title ?? `${t("common.EmpytState.empyState_no_data")}`}
      </Heading>
      <Text>
        {description ?? `${t("common.EmpytState.empyState_check_file")}`}
      </Text>
    </VStack>
  )
}

export default EmptyState
