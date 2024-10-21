import { Router } from "express";
import { httpHandler } from "../../helper/response/errorUtil.js";
import authorization from "../../helper/authrization/auth.js";
import { commonServices } from "./services.js";

const router = Router();

router.get(
  "/get-branch",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const result = await commonServices.getBranchesInfo(user);
    res.send(result);
  })
);
router.get(
  "/dashboard-card-info-1/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const {branch_id} = req.params
    const result = await commonServices.getDashboardCardsInfo(user, branch_id);
    res.send(result);
  })
);
router.get(
  "/dashboard-card-info-2/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const {branch_id} = req.params
    const result = await commonServices.getDashboardCardsInfo2(user, branch_id);
    res.send(result);
  })
);


export default router;
