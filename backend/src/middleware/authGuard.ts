import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

// const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyAdmin(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);
    (req as any).admin = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}
