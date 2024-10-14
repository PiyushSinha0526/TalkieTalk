import { createContext, ReactNode, useContext, useMemo } from "react";
import io, { Socket } from "socket.io-client";
import { serverUrl } from "./constants";

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<Socket | null>(null);

const useSocket = ()=>useContext(SocketContext);

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = useMemo(
    () =>
      io(serverUrl, {
        withCredentials: true,
        transports: ["websocket"],
      }),
    [],
  );
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { useSocket, SocketProvider };
