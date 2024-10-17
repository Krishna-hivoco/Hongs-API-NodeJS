import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../config/db.js";

const getBranchesInfo = async (user) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person")
  );
  const connection = await getConnection();
  try {
    const query = `SELECT * FROM hongs_branch`;
    const [rows] = await connection.execute(query);

    return rows;
  } finally {
    connection.release();
  }
};

const getDashboardCardsInfo = async (user, branch_id) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person")
  );

  const connection = await getConnection();
  try {
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
    END AS percentage_change,
    CASE
      WHEN pm.total_notifications = 0 THEN 'no data for previous month'
      WHEN cm.total_notifications > pm.total_notifications THEN 'gain'
      WHEN cm.total_notifications < pm.total_notifications THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;

    const [notification_row] = await connection.execute(notificationquery, [
      branch_id,
      branch_id,
    ]);
    const notification_rows = notification_row[0];

    const upsellattemptedquery = `
  WITH current_month AS (
    SELECT upsell_attempted AS total_upsell_attempted
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT COUNT(*) AS total_upsell_attempted
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_upsell_attempted AS current_month_total,
    pm.total_upsell_attempted AS previous_month_total,
    CASE 
      WHEN pm.total_upsell_attempted = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_upsell_attempted - pm.total_upsell_attempted) / pm.total_upsell_attempted) * 100
    END AS percentage_change,
    CASE
      WHEN pm.total_upsell_attempted = 0 THEN 'no data for previous month'
      WHEN cm.total_upsell_attempted > pm.total_upsell_attempted THEN 'gain'
      WHEN cm.total_upsell_attempted < pm.total_upsell_attempted THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;

    const [upsell_attempted_rows] = await connection.execute(
      upsellattemptedquery,
      [branch_id, branch_id]
    );

    const upsells_attempted_rows = upsell_attempted_rows[0];
    const total_order_query = `
  WITH current_month AS (
    SELECT upsell_attempted AS total_order
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT COUNT(*) AS total_order
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_order AS current_month_total,
    pm.total_order AS previous_month_total,
    CASE 
      WHEN pm.total_order = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_order - pm.total_order) / pm.total_order) * 100
    END AS percentage_change,
    CASE
      WHEN pm.total_order = 0 THEN 'no data for previous month'
      WHEN cm.total_order > pm.total_order THEN 'gain'
      WHEN cm.total_order < pm.total_order THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;
    const [total_order_rows] = await connection.execute(total_order_query, [
      branch_id,
      branch_id,
    ]);
    const total_orders_rows = total_order_rows[0];

    return {
      notification: notification_rows,
      upsell_attempted: upsells_attempted_rows,
      order: total_orders_rows,
    };
  } finally {
    connection.release();
  }
};
const getDashboardCardsInfo2 = async (user, branch_id) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person")
  );

  const connection = await getConnection();
  try {
    const customerquery = `
  WITH current_month AS (
    SELECT SUM(male_count+female_count) AS total_customers
    FROM customer_data
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT SUM(male_count+female_count) AS total_customers
    FROM customer_data
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_customers AS current_month_total,
    pm.total_customers AS previous_month_total,
    CASE 
      WHEN pm.total_customers = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_customers - pm.total_customers) / pm.total_customers) * 100
    END AS percentage_change,
    CASE
      WHEN pm.total_customers = 0 THEN 'no data for previous month'
      WHEN cm.total_customers > pm.total_customers THEN 'gain'
      WHEN cm.total_customers < pm.total_customers THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;

    const [customer_row] = await connection.execute(customerquery, [
      branch_id,
      branch_id,
    ]);
    const customers_rows = customer_row[0];

    const upsellattemptedquery = `
  WITH current_month AS (
    SELECT upsell_attempted AS total_upsell_attempted
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT COUNT(*) AS total_upsell_attempted
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_upsell_attempted AS current_month_total,
    pm.total_upsell_attempted AS previous_month_total,
    CASE 
      WHEN pm.total_upsell_attempted = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_upsell_attempted - pm.total_upsell_attempted) / pm.total_upsell_attempted) * 100
    END AS percentage_change,
    CASE
      WHEN pm.total_upsell_attempted = 0 THEN 'no data for previous month'
      WHEN cm.total_upsell_attempted > pm.total_upsell_attempted THEN 'gain'
      WHEN cm.total_upsell_attempted < pm.total_upsell_attempted THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;
    const [upsell_attempted_rows] = await connection.execute(
      upsellattemptedquery,
      [branch_id, branch_id]
    );
    const upsells_attempted_rows = upsell_attempted_rows[0];
    const total_order_query = `
  WITH current_month AS (
    SELECT upsell_attempted AS total_order
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT COUNT(*) AS total_order
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_order AS current_month_total,
    pm.total_order AS previous_month_total,
    CASE 
      WHEN pm.total_order = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_order - pm.total_order) / pm.total_order) * 100
    END AS percentage_change,
    CASE
      WHEN pm.total_order = 0 THEN 'no data for previous month'
      WHEN cm.total_order > pm.total_order THEN 'gain'
      WHEN cm.total_order < pm.total_order THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;
    const [total_order_rows] = await connection.execute(total_order_query, [
      branch_id,
      branch_id,
    ]);
    const total_orders_rows = total_order_rows[0];
    return {
      customer: customers_rows,
      upsell_attempted: upsells_attempted_rows,
      order: total_orders_rows,
    };
  } finally {
    connection.release();
  }
};

export const commonServices = {
  getBranchesInfo,
  getDashboardCardsInfo,
  getDashboardCardsInfo2,
};
