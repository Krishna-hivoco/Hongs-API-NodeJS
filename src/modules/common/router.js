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
    const { branch_id } = req.params;
    const result = await commonServices.getDashboardCardsInfo(user, branch_id);
    res.send(result);
  })
);
router.get(
  "/dashboard-card-info-2/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id } = req.params;
    const result = await commonServices.getDashboardCardsInfo2(user, branch_id);
    res.send(result);
  })
);
router.get(
  "/dashboard-customer-satisfied/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id } = req.params;

    const { start_date, end_date } = req.query;
    const result = await commonServices.getDashboardSatisfiedGraph(
      user,
      branch_id,
      start_date,
      end_date
    );
    res.send(result);
  })
);
router.post(
  "/send-notification",
  // authorization.auth,
  httpHandler(async (req, res) => {
    const { to, branchName, issueTitle, issueDescription, issueDetails } =
      req.body;
    const result = await commonServices.sendNotification(
      to,
      branchName,
      issueTitle,
      issueDescription,
      issueDetails
    );
    res.send(result);
  })
);
router.post(
  "/send-upselling-feedback",
  // authorization.auth,
  httpHandler(async (req, res) => {
    const { to, branchName } = req.body;
    const result = await commonServices.sendUpsellEmail(to, branchName);
    res.send(result);
  })
);

// io.on("connection", (socket) => {
//   console.log("a user connected");
// });

export default router;
