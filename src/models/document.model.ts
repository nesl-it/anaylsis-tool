import mongoose, { Schema, Document as Doc } from "mongoose";
import { paginate, toJSON } from "./plugins";

export type CSVDocument = Doc & {
  ownerId: String;
  embeddings: [number];
  category: String;
  project: String;
  totalInvoiced: String;
  totalUninvoiced: String;
  reportPeriod: String;
  budgetUpdate: String;
  issuesWorkedOnThisWeek: String;
  tasksIssuesPlannedNextWeek: String;
  task: String;
  description: String;
  status: String;
  dates: String;
  owner: String;
  workLogged: String;
};

const csvDocumentSchema = new Schema<CSVDocument>(
  {
    ownerId: String,
    category: String,
    project: String,
    totalInvoiced: String,
    totalUninvoiced: String,
    reportPeriod: String,
    budgetUpdate: String,
    issuesWorkedOnThisWeek: String,
    tasksIssuesPlannedNextWeek: String,
    task: String,
    description: String,
    status: String,
    dates: String,
    owner: String,
    workLogged: String,
    embeddings: { type: [Number] },
  },
  { timestamps: true }
);
export type PDFDocument = Doc & {
  ownerId: String;
  embeddings: [number];
  project: String;
  text: String;
};

const pdfDocumentSchema = new Schema<PDFDocument>(
  {
    ownerId: String,
    text: String,
    project: String,
    embeddings: { type: [Number] },
  },
  { timestamps: true }
);

// documentSchema.plugin(toJSON);
// documentSchema.plugin(paginate);

export const CSVSchema = mongoose.model<CSVDocument>("CSVSchema", csvDocumentSchema, "csvschema");
export const PDFSchema = mongoose.model<PDFDocument>("PDFSchema", pdfDocumentSchema, "pdfschema");
