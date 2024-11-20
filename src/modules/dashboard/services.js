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
    };
  } finally {
    connection.release();
  }
};

const dashboardService = {
  getCardData,
};

export default dashboardService;
