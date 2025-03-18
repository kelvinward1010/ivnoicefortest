import {
  type DriversGetFolderFilteredData,
  type DriversGetProjectFolderData,
  DriversService,
} from "@/client"
import { appConfigs } from "@/configs/app"
import type { IDataReponse } from "@/types/drive"
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

interface CreateFolderParams {
  parentId: string
  name: string
}

interface UploadFileParams {
  parentId: string
  file: File
  projectId?: string
  accountId?: string
}

interface DeleteFileParams {
  parentId: string
  fileId: string
  projectId?: string
  accountId?: string
}

interface RenameFileParams {
  fileId: string
  newName: string
  parentId?: string | null
  projectId?: string
  accountId?: string
}

interface CreateAccountFolderParams {
  accountId: string
  accountName: string
}

interface CreateProjectFolderParams {
  name: string
  projectId: string
  accountId: string
}

const commonQueryOptions = {
  staleTime: 1000 * 60 * 10,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
}

const handleMutationError = (error: unknown, defaultMessage: string) => {
  const message = (error as any)?.response?.data?.message || defaultMessage
  throw new Error(message)
}

export const useDriveFolderContents = (currentFolderId: string | null) => {
  const queryKey = [
    "drive",
    "contents",
    currentFolderId ?? appConfigs.folderCMSId,
  ]

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn: () =>
      DriversService.getFolderContents({
        folderId: currentFolderId ?? appConfigs.folderCMSId,
      }),
    ...commonQueryOptions,
  })

  return {
    folders: data?.folders || [],
    files: data?.files || [],
    ...rest,
  }
}

export function useGetProjectFolder({
  projectId,
}: DriversGetProjectFolderData) {
  const queryKey = ["drive", "project", projectId]

  return useQuery({
    queryKey,
    queryFn: () => DriversService.getProjectFolder({ projectId }),
    ...commonQueryOptions,
  })
}

export function useGetFolderFiltered({
  projectId,
  accountId,
  folderTypes,
}: DriversGetFolderFilteredData): IDataReponse {
  const queryKey = ["drive", projectId, accountId, "filtered"]

  const { data, refetch, ...rest } = useQuery<any>({
    queryKey,
    queryFn: () =>
      DriversService.getFolderFiltered({
        projectId,
        accountId,
        folderTypes,
      }),
    ...commonQueryOptions,
    enabled: !!projectId || !!accountId,
  })

  return {
    main_folder: {
      id: data?.data?.main_folder?.id,
      name: data?.data?.main_folder?.name,
    },
    data: {
      nda: data?.data?.subfolders?.NDA ?? [],
      ma: data?.data?.subfolders?.MA ?? [],
      sow: data?.data?.subfolders?.SOW ?? [],
      invoice: data?.data?.subfolders?.Invoice ?? [],
    },
    refetch,
    ...rest,
  }
}

const useDriveMutation = <T extends Record<string, any>>(
  mutationFn: (params: T) => Promise<unknown>,
  getInvalidateKeys: (params: T) => QueryKey[],
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (_, params) => {
      const queryKeys = getInvalidateKeys(params)
      for (const key of queryKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
    onError: (error: unknown) => {
      handleMutationError(error, "Operation failed")
    },
  })
}

export const useCreateFolder = () =>
  useDriveMutation<CreateFolderParams>(
    ({ parentId, name }) =>
      DriversService.createFolderInParent({ parentId, name }),
    ({ parentId }) => [
      ["drive", "contents", parentId || appConfigs.folderCMSId],
    ],
  )

export const useUploadFile = () =>
  useDriveMutation<UploadFileParams>(
    ({ parentId, file }) => {
      const formData = new FormData()
      formData.append("file", file)
      return DriversService.uploadFileToFolder({
        parentId,
        formData: { file },
      })
    },
    ({ parentId, projectId, accountId }) => [
      ["drive", "contents", parentId],
      ...(projectId ? [["drive", "project", projectId]] : []),
      ...(accountId ? [["drive", "account", accountId]] : []),
    ],
  )

export const useDeleteFile = () =>
  useDriveMutation<DeleteFileParams>(
    ({ fileId }) => DriversService.deleteDriveFile({ fileId }),
    ({ parentId, projectId, accountId }) => [
      ["drive", "contents", parentId],
      ...(projectId ? [["drive", "project", projectId]] : []),
      ...(accountId ? [["drive", "account", accountId]] : []),
    ],
  )

export const useRenameFile = () =>
  useDriveMutation<RenameFileParams>(
    ({ fileId, newName }) =>
      DriversService.updateDriveFile({
        fileId,
        requestBody: { new_name: newName },
      }),
    ({ parentId, projectId, accountId }) => [
      ["drive", "contents", parentId || appConfigs.folderCMSId],
      ...(projectId ? [["drive", "project", projectId]] : []),
      ...(accountId ? [["drive", "account", accountId]] : []),
    ],
  )

export const useCreateAccountFolder = () =>
  useDriveMutation<CreateAccountFolderParams>(
    ({ accountId, accountName }) =>
      DriversService.createAccountFolder({
        accountId,
        accountName,
      }),
    ({ accountId }) => [["drive", "account", accountId]],
  )

export const useCreateProjectFolder = () =>
  useDriveMutation<CreateProjectFolderParams>(
    ({ name, projectId, accountId }) =>
      DriversService.createProjectFolder({
        name,
        projectId,
        accountId,
      }),
    ({ projectId }) => [["drive", "project", projectId]],
  )
