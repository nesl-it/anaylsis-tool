import mongoose, { Schema, Document } from "mongoose";
import { paginate, toJSON } from "./plugins";
import { UserI } from "./user.model";

export type ChatI = Document & {
  question: string;
  answer: string;
  creatorId: string;
  owner: UserI;
};

const chatSchema = new Schema<ChatI>(
  {
    question: String,
    answer: String,
    creatorId: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

chatSchema.plugin(toJSON);
chatSchema.plugin(paginate);

export const Chat = mongoose.model<ChatI>("Chat", chatSchema, "chat");
