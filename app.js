import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import "./src/config/mongodb.js";
import authModule from "./src/modules/auth/index.js";
import notificationModule from "./src/modules/notification/index.js";
import commonModule from "./src/modules/common/index.js";
import customerModule from "./src/modules/customer/index.js";
import upsellingModule from "./src/modules/upselling/index.js";
import procedureModule from "./src/modules/procedure/index.js";

dotenv.config();
const modules = [
  authModule,
  notificationModule,
  commonModule,
  customerModule,
  upsellingModule,
  procedureModule,
];

export const createApp = () => {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  // app.use((req, res, next) => {
  //   const allowedOrigins = ["http://localhost:3000"];
  //   const origin = req.headers.origin;
  //   if (allowedOrigins.includes(origin)) {
  //     res.setHeader("Access-Control-Allow-Origin", origin);
  //   }
  //   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Content-Type, Authorization, sentry-trace, baggage"
  //   );
  //   res.header("Access-Control-Allow-Credentials", true);
  //   return next();
  // });

  return app;
};

export const useModules = (app) => {
  modules.map((module) => module.init(app));
};

export const notFoundHandler = (req, res, next) => {
  next(
    createError(StatusCodes.NOT_FOUND, `${req.originalUrl} route not found`)
  );
};

export const errorHandler = (err, req, res, _next) => {
  res.status(err.statusCode || 500).send({
    msg: "something unwanted occured....",
    error: err.message,
  });
};

export const finishApp = (app) => {
  app.use(notFoundHandler);
  app.use(errorHandler);
};
