export const getDriveLinks = (fileId: string) => ({
  viewLink: `https://drive.google.com/file/d/${fileId}/view`,
  directLink: `https://drive.google.com/uc?id=${fileId}`,
  webPreviewLink: `https://drive.google.com/file/d/${fileId}/preview`,
})

export const colorIconFolder = "#F29F05"
