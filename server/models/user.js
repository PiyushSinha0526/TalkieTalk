import { Schema, model } from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      required: true,
      type: String,
      select: false,
    },
    profilePic: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

export const User = model("User", userSchema);
