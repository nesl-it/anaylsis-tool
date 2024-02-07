import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { apiOk, apiValidation, catchAsync } from "../utils/apiHelpers";
import { listProjectService, queryDocumentService, uploadDocService } from "../services/document.service";

export const uploadDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // console.log({ req: req.body });
  apiValidation(req, res);
  const result = await uploadDocService(req, res, next);
  apiOk(res, result);
});

export const queryDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await check("queryText", "Query text is required").isString().run(req);
  await check("projectIds", "Project Ids are required").isArray().run(req);
  apiValidation(req, res);
  const result = await queryDocumentService(req, res, next);
  apiOk(res, result);
});

export const listProjects = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  apiValidation(req, res);
  // const result = { id: req.user };
  const result = await listProjectService(req, res, next);
  apiOk(res, result);
});
