import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { createConnection } from "../../config/db.js";

const getAll = async (user, branch_id, filter_date, page, limit) => {
  assert(
    user.role == "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are not authorized person.")
  );
  const skip = (page - 1) * limit;
  const filters = [`branch_id=${branch_id}`];
  const params = [];
  if (filter_date) {
    filters.push("today_date = ?");
    params.push(filter_date);
  }
  const connection = await createConnection();
  const baseQuery = "SELECT *  FROM customer_data WHERE 1=1";
  const baseQueryFindSum =
    "SELECT SUM(male_count) AS total_male_count, SUM(female_count) AS total_female_count  FROM customer_data WHERE 1=1";
  const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
  const finalQuery = `${baseQuery}${whereClause} ORDER BY customerdata_id DESC LIMIT ${limit} OFFSET ${skip}`;
  const [result] = await connection.execute(finalQuery, params);
  const finalBaseQuery = `${baseQueryFindSum}${whereClause} ORDER BY customerdata_id DESC LIMIT ${limit} OFFSET ${skip}`;
  const [gender_data] = await connection.execute(finalBaseQuery, params);
  return { count: gender_data[0], result };
};

const notificationService = {
  getAll,
};

export default notificationService;
