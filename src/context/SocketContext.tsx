import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
export interface SocketContextType {
  socket: WebSocket | null
}

// export type SocketType = Socket | null
export const SocketContext = createContext<SocketContextType>({ socket: null })

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect((): any => {
    const ws = new WebSocket(`ws://${import.meta.env.VITE_SOCKET_HOST}/ws`)
    setSocket(ws)
  }, [])
  return (
    <SocketContext.Provider value={{ socket: socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext)
}
