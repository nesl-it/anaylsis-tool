import { NextFunction, Request, Response } from "express";
import { Chat } from "../models/chat.model";

export const listChatService = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const filter = {
    creatorId: req.body.creatorId,
    owner: req.user._id,
  };

  let records = await Chat.find(filter)
  return records;
};