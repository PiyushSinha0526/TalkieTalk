import { getSockets } from "../lib/helper.js";

const emitEvent = (req, event, users, message) => {
    const io = req.app.get('io');
    const userSocket = getSockets(users);
    io.to(userSocket).emit(event, message);
}

export default emitEvent