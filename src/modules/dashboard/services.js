import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../config/db.js";
import { selectedDateRange } from "../../helper/commonFunction.js";

const getCardData = async (user, branch_id, filter_date) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );
  const {
    previousPeriodStartStr,
    currentPeriodStartStr,
    currentPeriodEndStr,
    previousPeriodEndStr,
    period,
  } = selectedDateRange(filter_date);

  const filters = [`branch_id=${branch_id}`];
  const connection = await getConnection();
  try {
    const customer_base_query = `SELECT SUM (male_count+female_count) as total_customer FROM customer_data 
    WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ?`;
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const customer_query = `${customer_base_query}${whereClause}`;
    const [customerCurrentResult] = await connection.execute(customer_query, [
      currentPeriodStartStr,
      currentPeriodEndStr,
    ]);

    const customerCurrentSum = customerCurrentResult[0].total_customer || 0;
    const customerPreviousQuery = `${customer_base_query}${whereClause}`;
    const [customerPreviousResult] = await connection.execute(
      customerPreviousQuery,
      [previousPeriodStartStr, previousPeriodEndStr]
    );
    const customerPreviousSum = customerPreviousResult[0].total_customer || 0;
    const customerPercentageIncrease = customerPreviousSum
      ? (
          ((customerCurrentSum - customerPreviousSum) / customerPreviousSum) *
          100
        ).toFixed(2)
      : 0;

    //second query..
    const conversation_base_query = `SELECT SUM (total_order) as total_conversation FROM upselling
    WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ?`;
    const conversation_query = `${conversation_base_query}${whereClause}`;
    const [conversationCurrentResult] = await connection.execute(
      conversation_query,
      [currentPeriodStartStr, currentPeriodEndStr]
    );

    const conversationCurrentSum =
      conversationCurrentResult[0].total_conversation || 0;
    const conversationPreviousQuery = `${conversation_base_query} ${whereClause}`;
    const [conversationPreviousResult] = await connection.execute(
      conversationPreviousQuery,
      [previousPeriodStartStr, previousPeriodEndStr]
    );
    const conversationPreviousSum =
      conversationPreviousResult[0].total_conversation || 0;
    const conversationPercentageIncrease = conversationPreviousSum
      ? (
          ((conversationCurrentSum - conversationPreviousSum) /
            conversationPreviousSum) *
          100
        ).toFixed(2)
      : 0;

    //third query
    const upsell_attempted_base_query = `SELECT SUM (upsell_attempted) as total_upsell_attempted FROM upselling
    WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ?`;
    const upsell_attempted_query = `${upsell_attempted_base_query}${whereClause}`;
    const [upsell_attemptedCurrentResult] = await connection.execute(
      upsell_attempted_query,
      [currentPeriodStartStr, currentPeriodEndStr]
    );

    const upsell_attemptedCurrentSum =
      upsell_attemptedCurrentResult[0].total_upsell_attempted || 0;
    const upsell_attemptedPreviousQuery = `${upsell_attempted_base_query} ${whereClause}`;
    const [upsell_attemptedPreviousResult] = await connection.execute(
      upsell_attemptedPreviousQuery,
      [previousPeriodStartStr, previousPeriodEndStr]
    );
    const upsell_attemptedPreviousSum =
      upsell_attemptedPreviousResult[0].total_upsell_attempted || 0;
    const upsell_attemptedPercentageIncrease = upsell_attemptedPreviousSum
      ? (
          ((upsell_attemptedCurrentSum - upsell_attemptedPreviousSum) /
            upsell_attemptedPreviousSum) *
          100
        ).toFixed(2)
      : 0;

    //fourth query

    const upsell_successful_base_query = `SELECT SUM (upsell_successful) as total_upsell_successful FROM upselling
    WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ?`;
    const upsell_successful_query = `${upsell_successful_base_query}${whereClause}`;
    const [upsell_successfulCurrentResult] = await connection.execute(
      upsell_successful_query,
      [currentPeriodStartStr, currentPeriodEndStr]
    );

    const upsell_successfulCurrentSum =
      upsell_successfulCurrentResult[0].total_upsell_successful || 0;
    const upsell_successfulPreviousQuery = `${upsell_successful_base_query} ${whereClause}`;
    const [upsell_successfulPreviousResult] = await connection.execute(
      upsell_successfulPreviousQuery,
      [previousPeriodStartStr, previousPeriodEndStr]
    );
    const upsell_successfulPreviousSum =
      upsell_successfulPreviousResult[0].total_upsell_successful || 0;
    const upsell_successfulPercentageIncrease = upsell_successfulPreviousSum
      ? (
          ((upsell_successfulCurrentSum - upsell_successfulPreviousSum) /
            upsell_successfulPreviousSum) *
          100
        ).toFixed(2)
      : 0;

    //fifth query

    const notification_base_query = `SELECT count (message) as total_notification FROM notification
    WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ?`;
    const notification_query = `${notification_base_query}${whereClause}`;
    const [notificationCurrentResult] = await connection.execute(
      notification_query,
      [currentPeriodStartStr, currentPeriodEndStr]
    );

    const notificationCurrentSum =
      notificationCurrentResult[0].total_notification || 0;
    const notificationPreviousQuery = `${notification_base_query} ${whereClause}`;
    const [notificationPreviousResult] = await connection.execute(
      notificationPreviousQuery,
      [previousPeriodStartStr, previousPeriodEndStr]
    );
    const notificationPreviousSum =
      notificationPreviousResult[0].total_notification || 0;
    const notificationPercentageIncrease = notificationPreviousSum
      ? (
          ((notificationCurrentSum - notificationPreviousSum) /
            notificationPreviousSum) *
          100
        ).toFixed(2)
      : 0;

    return {
      period,
      customer: {
        customerCurrentSum,
        customerPreviousSum,
        customerPercentageIncrease,
      },
      conversation: {
        conversationCurrentSum,
        conversationPreviousSum,
        conversationPercentageIncrease,
      },
      upsell_attempted: {
        upsell_attemptedCurrentSum,
        upsell_attemptedPreviousSum,
        upsell_attemptedPercentageIncrease,
      },
      upsell_successful: {
        upsell_successfulCurrentSum,
        upsell_successfulPreviousSum,
        upsell_successfulPercentageIncrease,
      },
      notification: {
        notificationCurrentSum,
        notificationPreviousSum,
        notificationPercentageIncrease,
      },
    };
  } finally {
    connection.release();
  }
};

const customersData = async (user, branch_id, filter_date) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );
  const connection = await getConnection();
  const {
    previousPeriodStartStr,
    currentPeriodStartStr,
    currentPeriodEndStr,
    previousPeriodEndStr,
    period,
  } = selectedDateRange(filter_date);
  try {
    const filters = [`branch_id=${branch_id}`];
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const base_query =
      "SELECT SUM(male_count) as total_male_count, SUM(female_count) as total_female_count FROM customer_data WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ? ";
    const current_query = `${base_query}${whereClause}`;

    const [currentResult] = await connection.execute(current_query, [
      currentPeriodStartStr,
      currentPeriodEndStr,
    ]);
    const currentMaleSum = Number(currentResult[0].total_male_count) || 0;
    const currentFemaleSum = Number(currentResult[0].total_female_count) || 0;
    const previous_query = `${base_query}${whereClause}`;
    const [previousResult] = await connection.execute(previous_query, [
      previousPeriodStartStr,
      previousPeriodEndStr,
    ]);
    const previousMaleSum = Number(previousResult[0].total_male_count) || 0;
    const previousFemaleSum = Number(previousResult[0].total_female_count) || 0;
    const percentageIncrease =
      previousMaleSum + previousFemaleSum
        ? (
            ((currentMaleSum +
              currentFemaleSum -
              (previousMaleSum + previousFemaleSum)) /
              (previousMaleSum + previousFemaleSum)) *
            100
          ).toFixed(2)
        : 0;

    return {
      percentageIncrease,
      currentMaleSum,
      currentFemaleSum,
    };
  } finally {
    connection.release();
  }
};

const upsellData = async (user, branch_id, filter_date) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );
  const connection = await getConnection();
  const {
    previousPeriodStartStr,
    currentPeriodStartStr,
    currentPeriodEndStr,
    previousPeriodEndStr,
    period,
  } = selectedDateRange(filter_date);
  try {
    const filters = [`branch_id=${branch_id}`];
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const base_query =
      "SELECT SUM(total_order) as total_order, SUM(upsell_successful) as total_upsell_successful, SUM(upsell_attempted) as total_upsell_attempted FROM upselling WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ? ";
    const current_query = `${base_query}${whereClause}`;

    const [currentResult] = await connection.execute(current_query, [
      currentPeriodStartStr,
      currentPeriodEndStr,
    ]);
    const currentTotalOrder = currentResult[0].total_order || 0;
    const currentTotalsuccessful =
      currentResult[0].total_upsell_successful || 0;
    const currentTotalAttempted = currentResult[0].total_upsell_attempted || 0;

    return {
      currentTotalOrder,
      currentTotalAttempted,
      currentTotalsuccessful,
    };
  } finally {
    connection.release();
  }
};

const procedureData = async (user, branch_id, filter_date) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );
  const connection = await getConnection();
  const { currentPeriodStartStr, currentPeriodEndStr } =
    selectedDateRange(filter_date);
  try {
    const filters = [`branch_id=${branch_id}`];
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const base_query =
      "SELECT SUM(all_step_followed) as all_step_followed, SUM(partially_step_followed) as partially_step_followed FROM three_step_followup WHERE STR_TO_DATE(today_date, '%m/%d/%Y') BETWEEN ? AND ? ";
    const current_query = `${base_query}${whereClause}`;

    const [currentResult] = await connection.execute(current_query, [
      currentPeriodStartStr,
      currentPeriodEndStr,
    ]);
    const currentTotalAll_step_followed =
      currentResult[0].all_step_followed || 0;
    const currentTotalPartially = currentResult[0].partially_step_followed || 0;

    return {
      currentTotalAll_step_followed,
      currentTotalPartially,
    };
  } finally {
    connection.release();
  }
};

const satisfactionData = async (user, branch_id, filter_date) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );

  const connection = await getConnection();

  try {
    let interval;
    switch (filter_date) {
      case "7d":
        interval = "7 DAY";
        break;
      case "14d":
        interval = "14 DAY";
        break;
      case "1m":
        interval = "1 MONTH";
        break;
      case "3m":
        interval = "3 MONTH";
        break;
      default:
        throw new Error("Invalid filter_date provided");
    }

    // Dynamic query construction
    const query = `
      SELECT 
        DATE_FORMAT(STR_TO_DATE(today_date, '%m/%d/%y'), '%m/%d/%y') AS date,
        SUM(yes_count) AS yes,
        SUM(no_count) AS no
      FROM 
        cus_satisfaction
      WHERE 
        STR_TO_DATE(today_date, '%m/%d/%y') >= CURDATE() - INTERVAL ${interval}
        AND branch_id = ?
      GROUP BY 
        DATE_FORMAT(STR_TO_DATE(today_date, '%m/%d/%y'), '%m/%d/%y')
      ORDER BY 
        STR_TO_DATE(today_date, '%m/%d/%y');
    `;

    console.log("Executing Query:", query, interval);
    const [results] = await connection.execute(query, [branch_id]);
    console.log("Query Results:", results);

    return results.map((row) => ({
      date: row.date,
      yes: row.yes,
      no: row.no,
    }));
  } finally {
    connection.release();
  }
};

const dashboardService = {
  getCardData,
  customersData,
  upsellData,
  procedureData,
  satisfactionData,
};

export default dashboardService;
