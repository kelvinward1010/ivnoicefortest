import { BreadcrumbCurrentLink, BreadcrumbLink } from "@chakra-ui/react"
import { HiOutlineSlash } from "react-icons/hi2"
import { BreadcrumbRoot } from "../../ui/breadcrumb"

interface BreadcrumbProps {
  folderHistory: { id: string; name: string }[]
  setFolderHistory: (history: { id: string; name: string }[]) => void
  setCurrentFolder: (folder: { id: string; name: string } | null) => void
}

const BreadcrumbNavigation: React.FC<BreadcrumbProps> = ({
  folderHistory,
  setFolderHistory,
  setCurrentFolder,
}) => {
  const handleBreadcrumbClick = (index: number) => {
    const newHistory = folderHistory.slice(0, index + 1)
    setFolderHistory(newHistory)
    const targetFolder = newHistory[newHistory.length - 1] || null
    setCurrentFolder(targetFolder)
  }

  return (
    <BreadcrumbRoot variant={"plain"} m={4} separator={<HiOutlineSlash />}>
      {folderHistory.map((folder, index) => (
        <div key={index}>
          {index === folderHistory.length - 1 ? (
            <BreadcrumbCurrentLink
              listStyle={"none"}
              onClick={() => handleBreadcrumbClick(index)}
            >
              {folder.name}
            </BreadcrumbCurrentLink>
          ) : (
            <BreadcrumbLink
              listStyle={"none"}
              href="#"
              onClick={() => handleBreadcrumbClick(index)}
            >
              {folder.name}
            </BreadcrumbLink>
          )}
        </div>
      ))}
    </BreadcrumbRoot>
  )
}

export default BreadcrumbNavigation
