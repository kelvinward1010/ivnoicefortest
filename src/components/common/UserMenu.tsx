import { Avatar } from "@/components/ui/avatar"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { Box, Flex, Icon, IconButton } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { FiLogOut } from "react-icons/fi"
import { IoSettingsOutline } from "react-icons/io5"
const UserMenu = () => {
  const { t } = useTranslation()
  const contentColor = useColorModeValue("ui.light", "rgb(39 39 42)")
  return (
    <>
      <Flex display={{ md: "flex" }} alignItems="center">
        <Box>
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton variant="outline" size="sm" rounded={"full"}>
                <Avatar variant="subtle" name="Sage Adebayo" />
              </IconButton>
            </MenuTrigger>
            <MenuContent bg={contentColor}>
              <MenuItem value="setting">
                <Icon as={IoSettingsOutline} />
                {t("components.common.UserMenu.setting")}
              </MenuItem>
              <MenuItem value="logout">
                <Icon as={FiLogOut} />
                {t("components.common.UserMenu.logout")}
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </Box>
      </Flex>
    </>
  )
}

export default UserMenu
