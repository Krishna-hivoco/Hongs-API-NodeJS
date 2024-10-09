import { Router } from "express";
import { httpHandler } from "../../helper/response/errorUtil.js";
import notificationService from "./services.js";
import authorization from "../../helper/authrization/auth.js";
import { timeAndDateFormate } from "../../helper/commonFunction.js";

const router = Router();

router.get(
  "/get-info/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { filter_date } = req.query;
    const { branch_id } = req.params;
    const result = await notificationService.getAllInfo(
      user,
      branch_id,
      filter_date,
      limit,
      page
    );
    res.send(result);
  })
);

export default router;
