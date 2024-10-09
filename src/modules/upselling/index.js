import { Router } from "express";
import upsellingRouter from "./router.js";
const router = Router();

router.use("/upselling", upsellingRouter);

const upsellingModule = {
  init: (app) => {
    app.use(router);
    console.log("Upselling Module Loaded 👤");
  },
};

export default upsellingModule;
