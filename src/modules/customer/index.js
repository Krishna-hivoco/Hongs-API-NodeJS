import { Router } from "express";
import customerRouter from "./router.js";
const router = Router();

router.use("/customer", customerRouter);

const customerModule = {
  init: (app) => {
    app.use(router);
    console.log("Customer module Loaded👤");
  },
};

export default customerModule;
