import { HttpStatusCode } from "../errors/types/HttpStatusCode";
import { NextFunction, Request, Response } from "express";
import { loadQAStuffChain } from "langchain/chains";
import { CSVSchema } from "../models/document.model";
import { Document as DefaultDocument } from "mongodb";
import { AppError } from "../errors/error.base";
import { OpenAI } from "langchain/llms/openai";
import { MONGODB_URI } from "../config/secrets";
import { MongoClient } from "mongodb";
import { ChainValues } from "langchain/dist/schema";
import { QueryDocumentI } from "./response/document.response";
import * as YouTubeUtils from "../utils/youtubeTranscriptions";
import * as LangChain from "../config/langchain";
import { Chat } from "../models/chat.model";

export const processAnswerUsingOpenAI = async (
  queryResponse: DefaultDocument[],
  question: string
): Promise<ChainValues> => {
  const llm = new OpenAI({});
  const chain = loadQAStuffChain(llm);

  // Execute the chain with input documents and question
  const result = await chain.call({
    input_documents: [new CSVSchema({ ownerId: queryResponse })],
    question: question,
  });

  return result;
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
    const collection = db.collection("csvschema");

    // Query for similar documents.
    const queryResponse = await collection
      .aggregate([
        {
          $vectorSearch: {
            queryVector: embeddings,
            path: "embeddings",
            numCandidates: 100,
            limit: 5,
            index: "default",
          },
        },
        // {
        //   $match: {
        //     creatorId: creatorId,
        //   },
        // },
      ])
      .toArray();

    if (queryResponse.length) {
      const result = await processAnswerUsingOpenAI(queryResponse, queryText);
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
