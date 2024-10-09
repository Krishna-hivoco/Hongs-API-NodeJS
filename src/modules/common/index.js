import { Router } from "express";
import commonRouter from "./router.js";
const router = Router();

router.use("/common", commonRouter);

const commonModule = {
  init: (app) => {
    app.use(router);
    console.log("Common module Loaded 👤");
  },
};

export default commonModule;
