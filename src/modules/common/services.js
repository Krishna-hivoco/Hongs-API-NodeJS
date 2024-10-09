import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { createConnection } from "../../config/db.js";

const getBranchesInfo = async (user) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person")
  );
  const connection = await createConnection();
  const query = `SELECT * FROM hongs_branch`;
  const [rows] = await connection.execute(query);

  return rows;
};

const getDashboardCardsInfo = async (user, branch_id) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person")
  );

  const connection = await createConnection();
  const notificationquery = `
  WITH current_month AS (
    SELECT COUNT(*) AS total_notifications
    FROM notification
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT COUNT(*) AS total_notifications
    FROM notification
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_notifications AS current_month_total,
    pm.total_notifications AS previous_month_total,
    CASE 
      WHEN pm.total_notifications = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_notifications - pm.total_notifications) / pm.total_notifications) * 100
    END AS percentage_change
  FROM current_month cm, previous_month pm;
`;

  const [rows] = await connection.execute(notificationquery, [
    branch_id,
    branch_id,
  ]);
  const notification_rows = rows[0];
  return { notification: notification_rows };
};

export const commonServices = {
  getBranchesInfo,
  getDashboardCardsInfo,
};
