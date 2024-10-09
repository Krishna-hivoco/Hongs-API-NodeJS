import { Router } from "express";
import notificationRouter from "./router.js";
const router = Router();

router.use("/notification", notificationRouter);

const notificationModule = {
  init: (app) => {
    app.use(router);
    console.log("Notification module Loaded 👤");
  },
};

export default notificationModule;
