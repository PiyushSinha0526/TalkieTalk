import { Schema, Types, model } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      required: true,
      type: String,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creater: {
      type: Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Chat = model("Chat", chatSchema);
