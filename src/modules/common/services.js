import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../config/db.js";
import { config } from "dotenv";
import twilio from "twilio";
import sendmail from "../../helper/sendEmail.js";

config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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
const sendNotification = async (
  to,
  branchName,
  issueTitle,
  issueDescription,
  issueDetails
) => {
  const msg = {
    to: to,
    subject: `Urgent: ${issueTitle} at ${branchName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${issueTitle} at ${branchName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 40px auto;
            border: 1px solid #e1e2e3;
        }
        .header {
            text-align: center;
            padding: 10px;
            background-color: #e73946;
            color: #ffffff;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h1 {
            font-size: 24px;
            color: #333333;
        }
        .content p {
            font-size: 16px;
            color: #666666;
           
        }
       
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #e73946;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #999999;
            padding: 20px;
        }
        h1 {
            color: #008CBA;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Urgent: ${issueTitle} at ${branchName}</h2>
        </div>
        <div class="content">
            <h1>Dear Admin,</h1>
            <p>${issueDescription}</p>
            <p>Details:</p>
            <ul>
                ${issueDetails.map((detail) => `<li>${detail}</li>`).join("")}
            </ul>
            <p>Please take action to resolve this issue as soon as possible.</p>
            <p>If you have any questions or need further details, feel free to contact us.</p>
            <p>Best Regards,<br>Hong's Kitchen </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Hong's Kitchen. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    
`,
  };

  await sendmail(msg);

  return { msg: "Email send successfully" };
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
    SELECT SUM(upsell_attempted) AS total_upsell_attempted
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
     SELECT SUM(upsell_attempted) AS total_upsell_attempted
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
   SELECT SUM(total_order) AS total_order
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT SUM(total_order) AS total_order
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

    const upsellsuccessfulquery = `
  WITH current_month AS (
    SELECT SUM(upsell_successful) AS total_upsell_successful
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE())
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE())
      AND branch_id = ?
  ),
  previous_month AS (
    SELECT SUM(upsell_successful) AS total_upsell_successful
    FROM upselling
    WHERE MONTH(STR_TO_DATE(today_date, '%m/%d/%Y')) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(STR_TO_DATE(today_date, '%m/%d/%Y')) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND branch_id = ?
  )
  SELECT
    cm.total_upsell_successful AS current_month_total,
    pm.total_upsell_successful AS previous_month_total,
    CASE 
      WHEN pm.total_upsell_successful = 0 THEN NULL -- Avoid division by zero
      ELSE ((cm.total_upsell_successful - pm.total_upsell_successful) / pm.total_upsell_successful) * 100
    END AS percentage_change,
    CASE
      WHEN pm.total_upsell_successful = 0 THEN 'no data for previous month'
      WHEN cm.total_upsell_successful > pm.total_upsell_successful THEN 'gain'
      WHEN cm.total_upsell_successful < pm.total_upsell_successful THEN 'loss'
      ELSE 'no change'
    END AS status
  FROM current_month cm, previous_month pm;
`;
    const [upsell_successful_rows] = await connection.execute(
      upsellsuccessfulquery,
      [branch_id, branch_id]
    );
    const upsells_successful_rows = upsell_successful_rows[0];

    return {
      customer: customers_rows,
      upsell_successful: upsells_successful_rows,
    };
  } finally {
    connection.release();
  }
};

const getDashboardSatisfiedGraph = async (
  user,
  branch_id,
  start_date,
  end_date
) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );

  const connection = await getConnection();
  try {
    const query = `

   SELECT 
    DATE_FORMAT(STR_TO_DATE(today_date, '%m/%d/%Y'), '%Y-%m-%d') AS formatted_date,
    SUM(yes_count) AS total_yes_count,
    SUM(no_count) AS total_no_count
  FROM cus_satisfaction
  WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') AND STR_TO_DATE(?, '%m/%d/%Y')
  GROUP BY formatted_date
  ORDER BY formatted_date;
  
`;

    const [rows] = await connection.execute(query, [start_date, end_date]);
    return rows;
  } finally {
    connection.release();
  }
};

export const commonServices = {
  getBranchesInfo,
  getDashboardCardsInfo,
  getDashboardCardsInfo2,
  getDashboardSatisfiedGraph,
  sendNotification,
};
