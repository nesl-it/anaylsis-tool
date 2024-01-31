import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { apiOk, apiValidation, catchAsync } from "../utils/apiHelpers";
import { queryDocumentService, uploadDocService } from "../services/document.service";

export const uploadDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // console.log({ req: req.body });
  apiValidation(req, res);
  const result = await uploadDocService(req, res, next);
  apiOk(res, result);
});

export const queryDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await check("queryText", "Query text is required").isString().run(req);
  apiValidation(req, res);
  // const result = { id: req.user };
  const result = await queryDocumentService(req, res, next);
  apiOk(res, result);
});
