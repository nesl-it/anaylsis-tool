import {
  errorUncughtException,
  errorHandler404,
  errorHandlerAll,
  errorUnhandledRejection,
} from "./utils/apiHelpers";
import { MONGODB_URI, SESSION_SECRET } from "./config/secrets";

process.on("uncaughtException", errorUncughtException);

import cors from "cors";
import express from "express";
import compression from "compression";
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import mongoInit from "./config/database";
import * as AppRoutes from "./routes";

const app = express();
mongoInit(MONGODB_URI);

// Express configuration
app.use(cors());
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      mongoUrl: MONGODB_URI,
    }),
  })
);

app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Listings
app.use("/v1/user/auth", AppRoutes.user);
app.use("/v1/document", AppRoutes.document);
app.use("/v1/chat", AppRoutes.chat);

app.use("/", (req, res) => {
  res.json({
    status: "LIVE FROM SERVER!",
  });
});

// Handling 404 and  Global errors here
app.all("*", errorHandler404);

// Handling for any other uncatch errors
app.use(errorHandlerAll);

process.on("unhandledRejection", errorUnhandledRejection);

export default app;
