import { Router } from "express";
import procedureRouter from "./router.js";
const router = Router();

router.use("/procedure", procedureRouter);

const procedureModule = {
  init: (app) => {
    app.use(router);
    console.log("Procedure Module Loaded");
  },
};

export default procedureModule;
