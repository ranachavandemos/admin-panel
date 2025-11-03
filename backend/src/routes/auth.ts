import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";
import { JWT_SECRET } from "../config.js";

interface LoginBody {
  username: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginBody }>("/login", async (request, reply) => {
    try {
      const { username, password } = request.body || {};
      if (!username || !password) {
        return reply
          .code(400)
          .send({ error: "Username and password required" });
      }

      const admin: any = await Admin.findOne({ where: { username } });
      if (!admin) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          role: admin.role || "admin",
        },
        JWT_SECRET as string,
        { expiresIn: "4h" }
      );

      return reply.send({
        ok: true,
        token,
        role: admin.role || "admin",
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({
        error: "Login failed",
        details: err.message,
      });
    }
  });
}
