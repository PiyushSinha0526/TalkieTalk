import { Schema, model } from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      require: true,
      type: String,
      unique: true,
    },
    name: {
      type: String,
      require: true,
    },
    password: {
      require: true,
      type: String,
      select: false,
    },
    profilePic: {
      public_id: {
        type: String,
        require: true,
      },
      url: {
        type: String,
        require: true,
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
