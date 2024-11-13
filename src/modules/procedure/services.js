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

    const baseQueryCount =
      "SELECT COUNT(*) AS total_rows FROM three_step_followup WHERE 1=1";

    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const finalQuery = `${baseQuery}${whereClause} ORDER BY followUp_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const [result] = await connection.execute(finalQuery, params);
    const finalBaseQuery = `${baseQueryFindSum}${whereClause}`;
    const [gender_data] = await connection.execute(finalBaseQuery, params);
    //total row
    const finalCountQuery = `${baseQueryCount}${whereClause}`;
    const [countResult] = await connection.execute(finalCountQuery, params);
    const totalRows = countResult[0].total_rows;
    return { totalRows, count: gender_data[0], result };
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
    const allquery = `
  SELECT SUM(c.all_step_followed) AS all_step_followed FROM three_step_followup as c
  JOIN hongs_branch as b
  WHERE STR_TO_DATE(c.today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') 
  AND STR_TO_DATE(?, '%m/%d/%Y') AND c.branch_id=?;
`;
    const [all_rows] = await connection.execute(allquery, [
      start_date,
      end_date,
      branch_id,
    ]);
    const partialquery = `
  SELECT SUM(c.partially_step_followed) AS total_partial_count FROM three_step_followup as c
  JOIN hongs_branch as b
  WHERE STR_TO_DATE(c.today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') 
  AND STR_TO_DATE(?, '%m/%d/%Y') AND c.branch_id=?;
`;

    const [partial_rows] = await connection.execute(partialquery, [
      start_date,
      end_date,
      branch_id,
    ]);
    const noquery = `
  SELECT SUM(c.no_step_followed) AS total_no_count FROM three_step_followup as c
  JOIN hongs_branch as b
  WHERE STR_TO_DATE(c.today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') 
  AND STR_TO_DATE(?, '%m/%d/%Y') AND c.branch_id=?;
`;
    const [no_rows] = await connection.execute(noquery, [
      start_date,
      end_date,
      branch_id,
    ]);
    return {
      all_step: all_rows[0],
      partial_step: partial_rows[0],
      no_step: no_rows[0],
    };
  } finally {
    connection.release();
  }
};

const procedureService = {
  getAll,
  dateWiseDashboardGraph,
};

export default procedureService;
