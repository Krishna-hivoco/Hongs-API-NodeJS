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

router.get(
  "/customer/:branch_id/:filter_date",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id, filter_date } = req.params;
    const result = await dashboardService.customersData(
      user,
      branch_id,
      filter_date
    );
    res.send(result);
  })
);
router.get(
  "/upsell/:branch_id/:filter_date",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id, filter_date } = req.params;
    const result = await dashboardService.upsellData(
      user,
      branch_id,
      filter_date
    );
    res.send(result);
  })
);
router.get(
  "/procedure/:branch_id/:filter_date",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id, filter_date } = req.params;
    const result = await dashboardService.procedureData(
      user,
      branch_id,
      filter_date
    );
    res.send(result);
  })
);
router.get(
  "/satisfaction/:branch_id/:filter_date",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id, filter_date } = req.params;
    const result = await dashboardService.satisfactionData(
      user,
      branch_id,
      filter_date
    );
    res.send(result);
  })
);

export default router;
