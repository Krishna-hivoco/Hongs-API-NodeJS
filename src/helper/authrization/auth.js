import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(400).send({ error: "Not authenticated." });
    }
    const token = authHeader.split(" ")[1];

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).send({ error: "Not authenticated." });
    }
    const users = {
      userId: decodedToken.auth_id,
      role: decodedToken.role,
    };

    req.user = users;
    next();
  } catch (err) {
    return err;
  }
};

const authorization = {
  auth,
};

export default authorization;
