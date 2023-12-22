import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { apiOk, apiValidation, catchAsync } from "../utils/apiHelpers";
import { queryDocumentService } from "../services/document.service";
import fs from "fs";
import csvParser from "csv-parser";
import { CSVSchema } from "../models/document.model";
import * as LangChain from "../config/langchain";

async function processResults(results, ownerId) {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result["Task"]) {
      const data = {
        category: results.find((res) => res["Category"])?.Category,
        project: results.find((res) => res["Project"])?.Project,
        totalInvoiced: findValueByKey(results, "Total Invoiced"),
        totalUninvoiced: findValueByKey(results, "Total Uninvoiced"),
        reportPeriod: results.find((res) => res["Report Period"])?.["Report Period"],
        budgetUpdate: results.find((res) => res["Budget Update"])?.["Budget Update"],
        issuesWorkedOnThisWeek: results.find((res) => res["Issues Worked On This Week"])?.[
          "Issues Worked On This Week"
        ],
        tasksIssuesPlannedNextWeek: JSON.stringify(
          results.find((res) =>
            Object.keys(res).some((prop) => prop.includes("Tasks/Issues Planned Next Week")) ? res : ""
          )
        ).replace(/({|})/g, ""),
        task: result["Task"],
        description: results[i + 1]?.Description,
        status: results[i + 2]?.Status,
        dates: results[i + 3]?.Dates,
        owner: results[i + 4]?.Owner,
        workLogged: (results[i + 5] && JSON.stringify(results[i + 5])).replace(/({|})/g, ""),
      };

      // let embeddings = await LangChain.generateTextEmbeddings(data);

      // Save data to the database
      const existingDocument = await CSVSchema.findOne({ ownerId, task: data.task });
      if (!existingDocument) {
        const newDocResult = new CSVSchema({
          ...data,
          ownerId: ownerId,
          // embeddings: embeddings,
        });
        await newDocResult.save();
      }
    }
  }
  return "success";
}

// Helper function to find the value by a specific keyword
function findValueByKey(results, keyword) {
  const foundResult = JSON.stringify(
    results.find((res) => Object.keys(res).some((key) => key.includes(keyword)))
  );
  const result = foundResult.replace(/({|})/g, "");
  return result;
}

export const uploadDocument = (req: Request, res: Response, next: NextFunction) => {
  apiValidation(req, res);

  const results: any[] = [];

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
      const ownerId = req.body.ownerId;
      processResults(results, ownerId);

      const result = { status: "Success" };
      apiOk(res, result);
      // Remove the uploaded CSV file after processing
      fs.unlinkSync(req.file.path);
    });
};

export const queryDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await check("queryText", "Query text is required").isString().run(req);

  apiValidation(req, res);
  const result = await queryDocumentService(req, res, next);
  apiOk(res, result);
});
