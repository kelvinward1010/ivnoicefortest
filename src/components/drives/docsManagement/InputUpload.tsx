import { colorIconFolder } from "@/constants/drive"
import { Button, Input } from "@chakra-ui/react"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { LuFolderUp } from "react-icons/lu"

interface InputUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>
  selectedFile: File | null
}

function InputUpload({
  handleFileChange,
  fileInputRef,
  selectedFile,
}: InputUploadProps) {
  const { t } = useTranslation()

  const setFileInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      if (el) {
        fileInputRef.current = el
      }
    },
    [fileInputRef],
  )

  return (
    <>
      <Input
        key={selectedFile ? `file-input-${selectedFile.name}` : "file-input"}
        ref={setFileInputRef}
        type="file"
        display="none"
        id="fileInput"
        onChange={handleFileChange}
      />
      <Button
        w={"135px"}
        display={"flex"}
        justifyContent={"start"}
        variant="outline"
        size="sm"
        border={"1px solid #ccc"}
        onClick={() => fileInputRef.current?.click()}
      >
        <LuFolderUp color={colorIconFolder} size={17} />
        {t("components.driver.actions.upload_file")}
      </Button>
    </>
  )
}

export default InputUpload
