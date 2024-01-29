import { NextFunction, Request, Response } from "express";
import { loadQAStuffChain } from "langchain/chains";
import { CSVSchema, PDFSchema } from "../models/document.model";
import { Document as DefaultDocument } from "mongodb";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { MONGODB_URI } from "../config/secrets";
import { MongoClient } from "mongodb";
import { ChainValues } from "langchain/dist/schema";
import { QueryDocumentI } from "./response/document.response";
import * as LangChain from "../config/langchain";
import { HttpStatusCode } from "../errors/types/HttpStatusCode";
import { AppError } from "../errors/error.base";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export const processAnswerUsingOpenAI = async (
  csvQueryResponse: DefaultDocument[],
  pdfQueryResponse: DefaultDocument[],
  question: string
): Promise<ChainValues> => {
  // const llm = new OpenAI({ maxTokens: -1, modelName: "gpt-4-1106-preview" });
  const llm = new OpenAIChat({
    maxTokens: -1,
    modelName: "gpt-4-1106-preview",
    temperature: 0,
    prefixMessages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
    ],
  });
  const chain = loadQAStuffChain(llm);

  const pdfDocs = csvQueryResponse.map((element) => {
    return new Document({ pageContent: JSON.stringify(element) });
  });
  const csvDocs = pdfQueryResponse.map((element) => {
    return new Document({ pageContent: JSON.stringify(element) });
  });
  const docs = csvDocs.concat(pdfDocs);
  // console.log({ csvQueryResponse: csvDocs.length, pdfQueryResponse: pdfDocs.length });
  const jsonResponse = {
    projectUpdate: {
      project_details: [
        {
          projectName: "should have name of that project",
          lastMeetingDate: "Date when last meeting was held",
          budgetUpdate: "Current budget update of that project",
          totalInvoiced: "current totalInvoiced amount of that project",
          Tasks: [
            {
              TaskID: "this will have the task ID",
              Description: "this attribute should show the description of task",
              Status: "this attribute should have the status of task",
              Importance:
                "this attribute should have the importance of task (create on your own by looking at the task details)",
              Progress: "this attribute should have the progress of task",
              Owner: "this attribute should have the owner or owners of tasks",
              Date: "this attribute should have the start and due dates of tasks",
            },
          ],
        },
      ],
      projectSummary: `Overall summary of Projects in paragraph format from these documents ${pdfDocs}`,
    },
  };

  const prompt = `Extract structured project summary information from the provided documents in a format similar to the example below. Ensure that the response is a valid JSON object and includes details for all the tasks in the given documents.
Example Format:
${JSON.stringify(jsonResponse)}
I provided you with ${
    docs.length
  } tasks, so make sure the response has a complete JSON representation of all those ${
    docs.length
  } tasks. The response should be structured and easily parsed using JSON.parse(). The question is: ${question}`;

  // Execute the chain with input documents and question
  const result = await chain.call({
    input_documents: docs,
    question: prompt,
  });

  const match = result.text.match(/```json\n([\s\S]+)\n```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { error: error };
    }
  } else {
    console.error("JSON not found in the provided string.");
    return { error: "JSON not found in the provided string." };
  }
};
export const queryDocumentService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<QueryDocumentI> => {
  let { queryText } = req.body;

  let embeddings = await LangChain.generateTextEmbeddings(queryText);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db("AnalysisTool");
    const csvCollection = db.collection("csvschema");
    const pdfCollection = db.collection("pdfschema");

    const fieldsToExclude = {
      createdAt: 0,
      _id: 0,
      updatedAt: 0,
      embeddings: 0,
      __v: 0,
      ownerId: 0,
      tasksIssuesPlannedNextWeek: 0,
    };

    // Query for similar documents
    const csvQueryResponse = await csvCollection
      .aggregate([
        {
          $match: {
            _id: req.user.id,
          },
        },
        {
          $vectorSearch: {
            queryVector: embeddings,
            path: "embeddings",
            numCandidates: 100,
            limit: 100,
            index: "default",
          },
        },
        {
          $project: fieldsToExclude,
        },
      ])
      .toArray();
    const pdfQueryResponse = await pdfCollection
      .aggregate([
        {
          $match: {
            _id: req.user.id,
          },
        },
        {
          $vectorSearch: {
            queryVector: embeddings,
            path: "embeddings",
            numCandidates: 100,
            limit: 100,
            index: "default",
          },
        },
      ])
      .toArray();
    if (pdfQueryResponse.length > 0 || csvQueryResponse.length > 0) {
      const result = await processAnswerUsingOpenAI(pdfQueryResponse, csvQueryResponse, queryText);
      return result;
    } else {
      return {
        text: "Sorry, I don't have any information about this in my dataset.",
      };
    }
  } finally {
    await client.close();
  }
};

export const processCSVResults = async (results, ownerId) => {
  try {
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

        // Save data to the database
        const existingDocument = await CSVSchema.findOne({ ownerId, task: data.task });
        if (!existingDocument) {
          let embeddings = await LangChain.generateTextEmbeddings(JSON.stringify(data));
          const newDocResult = new CSVSchema({
            ...data,
            ownerId: ownerId,
            embeddings: embeddings,
          });
          await newDocResult.save();
        } else {
          existingDocument.description = data.description;
          existingDocument.status = data.status;
          existingDocument.dates = data.dates;
          existingDocument.owner = data.owner;
          existingDocument.workLogged = data.workLogged;
          existingDocument.budgetUpdate = data.budgetUpdate;
          existingDocument.project = data.project;
          existingDocument.totalInvoiced = data.totalInvoiced;
          existingDocument.totalUninvoiced = data.totalUninvoiced;
          existingDocument.reportPeriod = data.reportPeriod;
          existingDocument.budgetUpdate = data.budgetUpdate;
          existingDocument.issuesWorkedOnThisWeek = data.issuesWorkedOnThisWeek;
          existingDocument.tasksIssuesPlannedNextWeek = data.tasksIssuesPlannedNextWeek;
          await existingDocument.save();
        }
      }
    }
    return "Success";
  } catch (error) {
    return "Error";
  }
};

// Helper function to find the value by a specific keyword
function findValueByKey(results, keyword) {
  const foundResult = JSON.stringify(
    results.find((res) => Object.keys(res).some((key) => key.includes(keyword)))
  );
  const result = foundResult.replace(/({|})/g, "");
  return result;
}

export const processPDFResults = async (data: string, ownerId: string, projectId: string) => {
  const llm = new OpenAI({ maxTokens: -1 });
  const chain = loadQAStuffChain(llm);
  const paragraphCount = Math.ceil(data.split(" ").length / 200);
  const { text } = await chain.call({
    input_documents: [new Document({ pageContent: data })],
    question: `From the given document above i want you to generate me  ${paragraphCount} meaningful paragraphs (string) each containing a complete and meaningful portion of the original text. Ensure that the generated text retains coherence and context. Please provide the processed output.`,
  });
  const result = text.split("\n\n").filter((item: string) => item.length > 2);
  result.map(async (item: string) => {
    let embeddings = await LangChain.generateTextEmbeddings(
      JSON.stringify({
        item,
        projectID: projectId,
      })
    );
    const pdfDocResult = new PDFSchema({
      ownerId: ownerId,
      embeddings: embeddings,
      text: item,
      project: projectId,
    });
    await pdfDocResult.save();
  });
  return result;
};

export const uploadDocService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<{ response: string }> => {
  const ownerId = req.user.id;
  const results: any[] = [];
  if (!req.file || !req.body.projectId) {
    throw new AppError(HttpStatusCode.BadRequest, "Either project file or project id is missing");
  }

  const fileExtension = path.extname(req.file.originalname);

  if (![".csv", ".pdf"].includes(fileExtension)) {
    console.log({ fileExtension });
    throw new AppError(HttpStatusCode.BadRequest, "Invalid file type");
  }

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
        fs.unlinkSync(req.file.path);
      });
  }
  if (fileExtension === ".pdf") {
    const projectId = req.body.projectId ?? "";

    const loader = new PDFLoader(req.file.path, {
      splitPages: false,
    });
    const docs = await loader.load();
    await processPDFResults(docs[0].pageContent, ownerId, projectId);
  }
  return { response: "Upload Success" };
};
