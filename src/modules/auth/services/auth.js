import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "http-errors-lite";
import { StatusCodes } from "http-status-codes";
import assert from "assert";
import { getConnection } from "../../../config/db.js";

const SignUp = async (data) => {
  const hashpassword = await bcrypt.hash(data.password, 10);
  const connection = await getConnection();
  try {
    const query =
      "INSERT INTO auth (name, email,password, role) VALUES (?, ?,?, ?)";
    const [result] = await connection.execute(query, [
      data.name,
      data.email,
      hashpassword,
      data.role,
    ]);

    return {
      id: result.insertId,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  } finally {
    connection.release();
  }
};

const SignIn = async (data) => {
  assert(
    data.email && data.password,
    createError(
      StatusCodes.BAD_REQUEST,
      "Make sure email and password are present"
    )
  );

  const connection = await getConnection();

  try {
    const query = "SELECT * FROM auth WHERE email=?";
    const [rows] = await connection.execute(query, [data.email]);

    assert(
      rows.length !== 0,
      createError(StatusCodes.NOT_FOUND, "You are an anonymous user")
    );
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    assert(
      isPasswordValid,
      createError(StatusCodes.UNAUTHORIZED, "Incorrect Password")
    );
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token will expire in 24 hour
    );

    delete user.password;
    assert(
      user.role == "super_admin",
      createError(StatusCodes.NOT_FOUND, "You are an anonymous user")
    );
    return { ...user, role: "Super Admin", token };
  } finally {
    connection.release();
  }
};

//Mic Auth
const ReceptionistSignUp = async (data) => {
 
  const hashpassword = await bcrypt.hash(data.password, 10);
  const connection = await getConnection();
  try {
    const query = "INSERT INTO mic_auth (store_id,password) VALUES (?, ?)";
    const [result] = await connection.execute(query, [
      data.store_id,
      hashpassword,
    ]);

    return {
      id: result.insertId,
      store_id: data.store_id,
    };
  } finally {
    connection.release();
  }
};
const ReceptionistSignIn = async (data) => {
  assert(
    data.store_id && data.password,
    createError(
      StatusCodes.BAD_REQUEST,
      "Make sure Store_ID and password are present"
    )
  );

  const connection = await getConnection();

  try {
    const query = "SELECT * FROM mic_auth WHERE store_id=?";
    const [rows] = await connection.execute(query, [data.store_id]);

    assert(
      rows.length !== 0,
      createError(StatusCodes.NOT_FOUND, "You are an anonymous user")
    );
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    assert(
      isPasswordValid,
      createError(StatusCodes.UNAUTHORIZED, "Incorrect Password")
    );
    const token = jwt.sign(
      {
        user_id: user.user_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token will expire in 24 hour
    );

    delete user.password;

    return { ...user, token };
  } finally {
    connection.release();
  }
};

const authService = {
  SignUp,
  SignIn,
  ReceptionistSignUp,
  ReceptionistSignIn,
};

export default authService;
