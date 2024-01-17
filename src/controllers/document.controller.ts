import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { apiOk, apiValidation, catchAsync } from "../utils/apiHelpers";
import { processCSVResults, processPDFResults, queryDocumentService } from "../services/document.service";
import fs from "fs";
import csvParser from "csv-parser";
import { CSVSchema } from "../models/document.model";
import * as LangChain from "../config/langchain";
import path from "path";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  apiValidation(req, res);
  const ownerId = req.body.ownerId;
  const results: any[] = [];
  const fileExtension = path.extname(req.file.originalname);

  if (fileExtension === ".csv") {
    fs.createReadStream(req.file.path)
      .pipe(csvParser({ headers: false }))
      .on("data", (data: any) => {
        const transformedData: Record<string, string> = {};
        Object.keys(data).forEach((key) => {
          transformedData[data["0"]] = data["1"];
        });
        results.push(transformedData);
      })
      .on("end", async () => {
        processCSVResults(results, ownerId);
        apiOk(res, { status: "Success" });

        // Remove the uploaded CSV file after processing
        fs.unlinkSync(req.file.path);
      });
  } else if (fileExtension === ".pdf") {
    const projectId = req.body.projectId ?? "";

    const loader = new PDFLoader(req.file.path, {
      splitPages: false,
    });
    const docs = await loader.load();
    const result = await processPDFResults(docs[0].pageContent, ownerId, projectId);
    apiOk(res, { status: "Success", result });
  } else {
    apiOk(res, { status: "Invalid File" });
  }
};

export const getSummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  apiValidation(req, res);
  let openApiString = "";
  const ownerId = "fvhtrfyug768h7";
  const results = await CSVSchema.find({ ownerId }).select(
    "-createdAt -_id -updatedAt -embeddings -__v -ownerId"
  );
  results.forEach((element) => {
    openApiString = openApiString + JSON.stringify(element);
  });
  console.log({ openApiString, length: results?.length });

  const result = results;
  apiOk(res, result);
});

export const queryDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await check("queryText", "Query text is required").isString().run(req);

  apiValidation(req, res);
  const result = await queryDocumentService(req, res, next);
  apiOk(res, result);
});
