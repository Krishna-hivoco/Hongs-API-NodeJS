import { Router } from "express";
import { httpHandler } from "../../helper/response/errorUtil.js";
import notificationService from "./services.js";
import authorization from "../../helper/authrization/auth.js";
import { timeAndDateFormate } from "../../helper/commonFunction.js";

const router = Router();

router.post(
  "/create",
  httpHandler(async (req, res) => {
    const data = req.body;
    const result = await notificationService.createNotification(data);
    res.send(result);
  })
);
router.get(
  "/show/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const { branch_id } = req.params;
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { filter_date } = req.query;
    const result = await notificationService.showAllNotification(
      user,
      branch_id,
      limit,
      page,
      filter_date
    );
    res.send(result);
  })
);
router.get(
  "/show/:branch_id/:id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const { id, branch_id } = req.params;
    const user = req.user;
    const result = await notificationService.openNotification(
      user,
      branch_id,
      id
    );
    res.send(result);
  })
);
router.get(
  "/message-count/:branch_id",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const { branch_id } = req.params;
    const { filter_date } = req.query;
    const result = await notificationService.messageCount(
      user,
      branch_id,
      filter_date
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
    const result = await notificationService.dashboardDateWiseGraph(
      user,
      branch_id,
      start_date,
      end_date
    );
    res.send(result);
  })
);

router.get(
  "/new-notification",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const result = await notificationService.newNotification(user);
    res.send(result);
  })
);
router.put(
  "/update-status",
  authorization.auth,
  httpHandler(async (req, res) => {
    const user = req.user;
    const result = await notificationService.updateNotificationStatus(user);
    res.send(result);
  })
);

export default router;
