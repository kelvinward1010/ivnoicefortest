import { useState } from "react"
import { useTranslation } from "react-i18next"
import LogoBlueOc from "/assets/images/blueoc.svg"

import { Button } from "@/components/ui/button"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { Box, Flex, Image, Text } from "@chakra-ui/react"
import UserMenu from "./UserMenu.tsx"

const LANGUAGES = [
  {
    name: "English",
    value: "en",
    img: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Flag_of_the_United_States_%28fixed%29.svg",
  },
  {
    name: "Tiếng Việt",
    value: "vi",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg",
  },
]

export default function Header() {
  const { i18n } = useTranslation()
  const menuBgColor = useColorModeValue("ui.secondary", "gray.800")
  const secBgColor = useColorModeValue("ui.light", "ui.darkSlate")
  const textColor = useColorModeValue("black", "white")
  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find((lang) => lang.value === i18n.language),
  )
  const changeLanguage = (lng: string) => {
    const lang = LANGUAGES.find((lang) => lang.value === lng)
    setSelectedLang(lang)
    i18n.changeLanguage(lng)
  }

  return (
    <Box
      display={"flex"}
      position="fixed"
      shadow={"sm"}
      p={4}
      alignItems="center"
      justifyContent="space-between"
      zIndex={999}
      width="100%"
      backgroundColor={secBgColor}
      transition={"all .15s ease-in-out"}
    >
      <Flex alignItems={"center"} justifyContent={"center"} gap={6} ml={2}>
        <Image src={LogoBlueOc} alt="Logo" w="36px" cursor={"pointer"} />
        <Text fontWeight={"600"} fontSize={"26px"} userSelect={"none"}>
          Contract Management
        </Text>
      </Flex>
      <Flex alignItems="center" gap={4}>
        <Box gridArea="select" outline={"none"}>
          <MenuRoot>
            <MenuTrigger asChild bgColor={menuBgColor}>
              <Button variant="outline" size="sm">
                <Flex alignItems={"center"} gap={2}>
                  <Image src={selectedLang?.img} h={"20px"} w={"34px"} />
                  <Text color={textColor}>{selectedLang?.name}</Text>
                </Flex>
              </Button>
            </MenuTrigger>
            <MenuContent>
              {LANGUAGES.map((lang) => (
                <MenuItem
                  key={lang.value}
                  value={lang.value}
                  onClick={() => changeLanguage(lang.value)}
                >
                  <Image src={lang?.img} h={"16px"} w={"20px"} />
                  {lang.name}
                </MenuItem>
              ))}
            </MenuContent>
          </MenuRoot>
        </Box>
        <ColorModeButton rounded="full" />
        <UserMenu />
      </Flex>
    </Box>
  )
}
