import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { apiOk, apiValidation, catchAsync } from "../utils/apiHelpers";
import {
  processCSVResults,
  processPDFResults,
  queryDocumentService,
  uploadDocService,
} from "../services/document.service";
import fs from "fs";
import csvParser from "csv-parser";
import path from "path";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { AppError } from "../errors/error.base";
import { HttpStatusCode } from "../errors/types/HttpStatusCode";

export const uploadDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  apiValidation(req, res);
  const result = await uploadDocService(req, res, next);
  console.log("result here:>>", result);
  apiOk(res, result);
  // const ownerId = req.user.id;
  // console.log({ userid: req.user.id });
  // const results: any[] = [];
  //   if (!req.file || !req.body.projectId) {
  //     throw new AppError(HttpStatusCode.BadRequest, "Either project file or project id is missing");
  //   }

  //   const fileExtension = path.extname(req.file.originalname);

  //   if (fileExtension === ".csv") {
  //     fs.createReadStream(req.file.path)
  //       .pipe(csvParser({ headers: false }))
  //       .on("data", (data: any) => {
  //         const transformedData: Record<string, string> = {};
  //         Object.keys(data).forEach((key) => {
  //           transformedData[data["0"]] = data["1"];
  //         });
  //         results.push(transformedData);
  //       })
  //       .on("end", async () => {
  //         processCSVResults(results, ownerId);
  //         apiOk(res, { response: "Success" });

  //         // Remove the uploaded CSV file after processing
  //         fs.unlinkSync(req.file.path);
  //       });
  //   } else if (fileExtension === ".pdf") {
  //     const projectId = req.body.projectId ?? "";

  //     const loader = new PDFLoader(req.file.path, {
  //       splitPages: false,
  //     });
  //     const docs = await loader.load();
  //     await processPDFResults(docs[0].pageContent, ownerId, projectId);
  //     apiOk(res, { response: "Upload Success" });
  //   } else {
  //     apiOk(res, { response: "Invalid File" });
  //   }
});

export const queryDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await check("queryText", "Query text is required").isString().run(req);

  apiValidation(req, res);
  const result = await queryDocumentService(req, res, next);
  apiOk(res, result);
});
