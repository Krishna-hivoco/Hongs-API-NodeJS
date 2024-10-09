import { Router } from "express";
import { httpHandler } from "../../helper/response/errorUtil.js";
import notificationService from "./services.js";
import authorization from "../../helper/authrization/auth.js";

const router = Router();

router.get(
  "/get/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { filter_date } = req.query;
    const result = await notificationService.getAll(
      user,
      branch_id,
      filter_date,
      page,
      limit
    );
    res.send(result);
  })
);
router.get(
  "/dashboard/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id } = req.params;

    const { start_date, end_date } = req.query;
    const result = await notificationService.dateWiseDashboardGraph(
      user,
      branch_id,
      start_date,
      end_date
    );
    res.send(result);
  })
);

//Customer Satisfaction

export default router;
