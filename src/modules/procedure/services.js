import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../config/db.js";

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
  const connection = await getConnection();
  try {
    const baseQuery = "SELECT * FROM three_step_followup WHERE 1=1";
    const baseQueryFindSum =
      "SELECT SUM(all_step_followed) AS all_step_followed, SUM(partially_step_followed) AS partially_step_followed, SUM(no_step_followed) AS no_step_followed  FROM three_step_followup WHERE 1=1";
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const finalQuery = `${baseQuery}${whereClause} ORDER BY followUp_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const [result] = await connection.execute(finalQuery, params);
    const finalBaseQuery = `${baseQueryFindSum}${whereClause} ORDER BY followUp_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const [gender_data] = await connection.execute(finalBaseQuery, params);
    return { count: gender_data[0], result };
  } finally {
    connection.release();
  }
};

const procedureService = {
  getAll,
};

export default procedureService;
