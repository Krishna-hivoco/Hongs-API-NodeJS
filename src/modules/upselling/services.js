import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { createConnection } from "../../config/db.js";

const getAllInfo = async (user, branch_id, filter_date, limit, page) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const skip = (page - 1) * limit;
  const connection = await createConnection();
  const baseQuery = `
  SELECT * FROM upselling
  WHERE 1 = 1
`;
  const numericalQuery = `SELECT SUM(upsell_attempted) AS total_upsell_attempted, SUM(upsell_successful) AS total_upsell_successful FROM upselling WHERE 1=1`;
  const filters = [`branch_id=${branch_id}`];
  const params = [];
  if (filter_date) {
    filters.push("today_date = ?");
    params.push(filter_date);
  }
  const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
  const finalQuery = `${baseQuery}${whereClause} ORDER BY upselling_id DESC LIMIT ${limit} OFFSET ${skip}`;
  const finalNumericQuery = `${numericalQuery}${whereClause} ORDER BY upselling_id DESC LIMIT ${limit} OFFSET ${skip}`;
  const [result] = await connection.execute(finalQuery, params);
  const [resultNumeric] = await connection.execute(finalNumericQuery, params);
  return { count: resultNumeric[0], result };
};

const upsellingService = {
  getAllInfo,
};

export default upsellingService;
