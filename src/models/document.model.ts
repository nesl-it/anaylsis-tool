import mongoose, { Schema, Document as Doc } from "mongoose";
import { paginate, toJSON } from "./plugins";

export type CSVDocument = Doc & {
  ownerId: String;
  embeddings: [number];
  category: String;
  project: String;
  totalInvoiced: String;
  rotalUninvoiced: String;
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
    rotalUninvoiced: String,
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

// documentSchema.plugin(toJSON);
// documentSchema.plugin(paginate);

export const CSVSchema = mongoose.model<CSVDocument>("CSVSchema", csvDocumentSchema, "csvschema");
