import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../config/db.js";

const getAllInfo = async (user, branch_id, filter_date, limit, page) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const skip = (page - 1) * limit;
  const connection = await getConnection();
  try {
    const baseQuery = `
  SELECT * FROM upselling
  WHERE 1 = 1
`;
    const numericalQuery = `SELECT SUM(upsell_attempted) AS total_upsell_attempted, SUM(upsell_successful) AS total_upsell_successful FROM upselling WHERE 1=1`;

    const baseQueryCount =
      "SELECT COUNT(*) AS total_rows FROM upselling WHERE 1=1";
    const filters = [`branch_id=${branch_id}`];
    const params = [];
    if (filter_date) {
      filters.push("today_date = ?");
      params.push(filter_date);
    }
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const finalQuery = `${baseQuery}${whereClause} ORDER BY upselling_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const finalNumericQuery = `${numericalQuery}${whereClause}`;
    const [result] = await connection.execute(finalQuery, params);
    const [resultNumeric] = await connection.execute(finalNumericQuery, params);
    const finalCountQuery = `${baseQueryCount}${whereClause}`;
    const [countResult] = await connection.execute(finalCountQuery, params);
    const totalRows = countResult[0].total_rows;
    return { totalRows, count: resultNumeric[0], result };
  } finally {
    connection.release();
  }
};

const upsellingService = {
  getAllInfo,
};

export default upsellingService;
