import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../config/db.js";
import { timeAndDateFormate } from "../../helper/commonFunction.js";

const createNotification = async (data) => {
  const connection = await getConnection();
  try {
    const query =
      "INSERT INTO notification (branch_id, message,today_date,time_of_message,action_taken) VALUES (?, ?,?,?,?)";

    const { formattedTime, formattedDate } = timeAndDateFormate();
    const [result] = await connection.execute(query, [
      data.branch_id,
      data.message,
      formattedDate,
      formattedTime,
      false,
    ]);
    return {
      id: result.insertId,
      branch_id: data.branch_id,
      message: data.message,
      date: data.date,
      time: data.time,
      action_taken: data.action_taken,
    };
  } finally {
    connection.release();
  }
};

const showAllNotification = async (
  user,
  branch_id,
  limit,
  page,
  filter_date
) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  if (!filter_date) {
    filter_date = "";
  }
  const skip = (page - 1) * limit;
  const connection = await getConnection();
  try {
    const baseQuery = `
  SELECT notification.*, hongs_branch.branch_name, hongs_branch.location 
  FROM notification
  JOIN hongs_branch ON notification.branch_id = hongs_branch.branch_id
  WHERE 1 = 1
`;

    const baseQueryCount =
      "SELECT COUNT(*) AS total_rows FROM notification WHERE 1=1";
    const filters = [`notification.branch_id=${branch_id}`];
    const params = [];
    if (filter_date) {
      filters.push("notification.today_date = ?");
      params.push(filter_date);
    }
    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const finalQuery = `${baseQuery}${whereClause} ORDER BY notification.notification_id DESC LIMIT ${limit} OFFSET ${skip}`;
    const [rows] = await connection.execute(finalQuery, params);
    const finalCountQuery = `${baseQueryCount}${whereClause}`;
    const [countResult] = await connection.execute(finalCountQuery, params);
    const totalRows = countResult[0].total_rows;
    return { totalRows, rows };
  } finally {
    connection.release();
  }
};

const openNotification = async (user, branch_id, id) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const connection = await getConnection();
  try {
    const query = `SELECT notification.*, hongs_branch.branch_name, hongs_branch.location 
    FROM notification
    JOIN hongs_branch ON notification.branch_id = hongs_branch.branch_id WHERE hongs_branch.branch_id=? AND notification.notification_id=?`;
    const [rows] = await connection.execute(query, [branch_id, id]);

    return { ...rows[0] };
  } finally {
    connection.release();
  }
};

const messageCount = async (user, branch_id, filter_date) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const filters = [`notification.branch_id=${branch_id}`];
  const params = [];
  if (filter_date) {
    filters.push("notification.today_date = ?");
    params.push(filter_date);
  }
  const connection = await getConnection();
  try {
    const baseQuery = `SELECT message, COUNT(*) as message_count
FROM notification
WHERE 1=1

`;

    const whereClause = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const finalQuery = `${baseQuery}${whereClause} GROUP BY message  ORDER BY message_count DESC;`;
    const [rows] = await connection.execute(finalQuery, params);
    return rows;
  } finally {
    connection.release();
  }
};

const dashboardDateWiseGraph = async (
  user,
  branch_id,
  start_date,
  end_date
) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const connection = await getConnection();
  try {
    const query = `
  SELECT DATE_FORMAT(STR_TO_DATE(n.today_date, '%m/%d/%Y'), '%Y-%m-%d') AS formatted_date,
         COUNT(*) AS notification_count
  FROM notification n
  JOIN hongs_branch b ON n.branch_id = b.branch_id
  WHERE STR_TO_DATE(n.today_date, '%m/%d/%Y') BETWEEN STR_TO_DATE(?, '%m/%d/%Y') 
        AND STR_TO_DATE(?, '%m/%d/%Y')
    AND n.branch_id = ?
  GROUP BY formatted_date
  ORDER BY formatted_date;
`;
    const [rows] = await connection.execute(query, [
      start_date,
      end_date,
      branch_id,
    ]);
    return rows;
  } finally {
    connection.release();
  }
};

const newNotification = async (user) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const connection = await getConnection();
  try {
    const query = `SELECT * FROM notification WHERE is_new = ?`;
    const [rows] = await connection.execute(query, [1]); // Explicitly passing 0 instead of false
    return rows;
  } finally {
    connection.release();
  }
};

const updateNotificationStatus = async (user) => {
  assert(
    user.role === "super_admin",
    createError(StatusCodes.UNAUTHORIZED, "You are Unauthorized.")
  );
  const connection = await getConnection();
  try {
    const query = `UPDATE notification SET is_new=? where is_new=?`;
    const [rows] = await connection.execute(query, [0, 1]); // Explicitly passing 0 instead of false
    return rows;
  } finally {
    connection.release();
  }
};

const notificationService = {
  createNotification,
  showAllNotification,
  openNotification,
  messageCount,
  dashboardDateWiseGraph,
  newNotification,
  updateNotificationStatus,
};

export default notificationService;
