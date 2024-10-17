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
    const baseQuery = "SELECT *  FROM customer_data WHERE 1=1";
    const baseQueryFindSum =
      "SELECT SUM(male_count) AS total_male_count, SUM(female_count) AS total_female_count  FROM customer_data WHERE 1=1";
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const finalQuery = `${baseQuery}${whereClause} ORDER BY customerdata_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const [result] = await connection.execute(finalQuery, params);
    const finalBaseQuery = `${baseQueryFindSum}${whereClause} ORDER BY customerdata_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const [gender_data] = await connection.execute(finalBaseQuery, params);
    return { count: gender_data[0], result };
  } finally {
    connection.release();
  }
};
const dateWiseDashboardGraph = async (
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
  const malequery = `
  SELECT SUM(c.male_count) AS total_male_count FROM customer_data as c
  JOIN hongs_branch as b
  WHERE STR_TO_DATE(c.today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') 
  AND STR_TO_DATE(?, '%m/%d/%Y') AND c.branch_id=?;
`;
  const [male_rows] = await connection.execute(malequery, [
    start_date,
    end_date,
    branch_id,
  ]);
  const femalequery = `
  SELECT SUM(c.female_count) AS total_female_count FROM customer_data as c
  JOIN hongs_branch as b
  WHERE STR_TO_DATE(c.today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') 
  AND STR_TO_DATE(?, '%m/%d/%Y') AND c.branch_id=?;
`;
  const [female_rows] = await connection.execute(femalequery, [
    start_date,
    end_date,
    branch_id,
  ]);
  return { male: male_rows[0], female: female_rows[0] };
} finally {
  connection.release();
}
};

const notificationService = {
  getAll,
  dateWiseDashboardGraph,
};

export default notificationService;
