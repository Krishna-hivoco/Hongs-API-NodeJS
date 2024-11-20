import { Router } from "express";
import dashboardRouter from "./router.js";
const router = Router();

router.use("/dashboard", dashboardRouter);

const dashboardModule = {
  init: (app) => {
    app.use(router);
    console.log("Dashboard module Loaded");
  },
};

export default dashboardModule;
