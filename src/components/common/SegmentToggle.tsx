import { Box, Button, Flex, Text } from "@chakra-ui/react"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
import { motion } from "framer-motion"
import { useColorModeValue } from "../ui/color-mode"

interface SegmentToggleProps<T extends string> {
  label?: string
  labelPosition?: "top" | "left"
  value: T
  onChange: (val: T) => void
  options: { label: string; value: T }[]
  size?: "sm" | "md" | "lg"
  colorScheme?: string
  height?: number
}

const MotionBox = motion(Box)

const SegmentToggle = <T extends string>({
  label,
  labelPosition,
  value,
  onChange,
  options,
  size = "md",
  colorScheme = "blue",
  height = 9,
}: SegmentToggleProps<T>) => {
  const selectedIndex = options.findIndex((opt) => opt.value === value)
  const textColor = useColorModeValue("black", "white")

  return (
    <Flex
      align={labelPosition === "left" ? "center" : "start"}
      direction={labelPosition === "left" ? "row" : "column"}
      gap={2}
    >
      {label && (
        <Text fontSize="sm" fontWeight="bold" color={textColor}>
          {label}
        </Text>
      )}
      <Box
        display="flex"
        bg="gray.100"
        p={"0"}
        borderRadius="full"
        alignItems="center"
        justifyContent="center"
        width="full"
        maxWidth="fit-content"
        position="relative"
        h={height}
      >
        <ToggleGroup.Root
          type="single"
          value={value}
          onValueChange={(val) => val && onChange(val as T)}
          style={{
            display: "flex",
            width: "100%",
            position: "relative",
            flex: 1,
            alignItems: "center",
          }}
        >
          <MotionBox
            layout
            position="absolute"
            bg={`${colorScheme}.500`}
            borderRadius="full"
            height="100%"
            width={`calc(100% / ${options.length})`}
            left={`calc(${selectedIndex} * 100% / ${options.length})`}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            zIndex={1}
          />

          {options.map((option) => (
            <ToggleGroup.Item
              style={{ cursor: "pointer" }}
              asChild
              key={option.value}
              value={option.value}
            >
              <Button
                size={size}
                color={value === option.value ? "white" : "gray.700"}
                fontWeight="bold"
                flex="1"
                position="relative"
                zIndex={2}
                textAlign="center"
                minWidth="fit-content"
                px={2}
                py={2}
                unstyled
                _hover={{ bg: "transparent" }}
              >
                {option.label}
              </Button>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </Box>
    </Flex>
  )
}

export default SegmentToggle
