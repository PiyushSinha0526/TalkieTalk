import { userSocketIDs } from "../app.js";

export const getSockets = (userIds = []) => {
  const sockets = userIds.map((id) => userSocketIDs.get(id.toString()));
  return sockets;
};
