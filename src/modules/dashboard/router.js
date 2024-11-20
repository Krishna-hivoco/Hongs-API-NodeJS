import { Router } from "express";
import { httpHandler } from "../../helper/response/errorUtil.js";
import dashboardService from "./services.js";
import authorization from "../../helper/authrization/auth.js";

const router = Router();

router.get(
  "/cards/:branch_id/:filter_date",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id, filter_date } = req.params;
    const result = await dashboardService.getCardData(
      user,
      branch_id,
      filter_date
    );
    res.send(result);
  })
);

export default router;
