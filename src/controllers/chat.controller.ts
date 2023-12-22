import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { apiOk, apiValidation, catchAsync } from "../utils/apiHelpers";
import { listChatService } from "../services/chat.service";

export const listChat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await check("creatorId", "Please attach creator id").isString().run(req);

  apiValidation(req, res);
  const result = await listChatService(req, res, next);
  apiOk(res, result);
});