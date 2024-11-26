import { Router } from "express";
import { httpHandler } from "../../../helper/response/errorUtil.js";
import authService from "../services/auth.js";

const router = Router();

// router.post(
//   "/register",
//   httpHandler(async (req, res) => {
//     const data = req.body;
//     const result = await authService.SignUp(data);
//     res.send(result);
//   })
// );
router.post(
  "/login",
  httpHandler(async (req, res) => {
    const data = req.body;
    const result = await authService.SignIn(data);
    res.send(result);
  })
);

export default router;
