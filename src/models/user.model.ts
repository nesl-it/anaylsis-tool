import bcrypt from "bcrypt";
import mongoose, { Schema, Document } from "mongoose";
import { BCRYPT_SALT } from "../config/secrets";
import { paginate, toJSON } from "./plugins";

export type UserI = Document & {
  displayPicture: string | null;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  comparePassword: (password: string) => { isMatch: boolean };
};

const userSchema = new Schema<UserI>(
  {
    displayPicture: { type: String, required: false, default: null },
    firstname: String,
    lastname: String,
    email: { type: String, unique: true, required: true, lowercase: true },
    password: String,
  },
  { timestamps: true, versionKey: false }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Password hashing middleware.
 */
userSchema.pre("save", async function (next) {
  const user = this as UserI;

  // If password is changed, we again generate hash
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, Number(BCRYPT_SALT));
  }
  next();
});

/**
 * Password comparison method.
 */
userSchema.methods.comparePassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return { isMatch };
};

export const User = mongoose.model<UserI>("User", userSchema, "user");
