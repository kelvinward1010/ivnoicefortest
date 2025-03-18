export interface DriveItem {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  parents?: string[]
  webViewLink?: string
  webContentLink?: string
  exportLinks?: Record<string, string>
}

export interface IDataReponse {
  main_folder: {
    id: string
    name: string
  }
  data: {
    nda?: {
      id: string
      files: DriveItem[]
    }
    ma?: {
      id: string
      files: DriveItem[]
    }
    sow?: {
      id: string
      files: DriveItem[]
    }
    invoice?: {
      id: string
      files: DriveItem[]
    }
  }
  error: Error | null
  isLoading: boolean
  refetch?: any
}
