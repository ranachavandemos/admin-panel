import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";
import { JWT_SECRET } from "../config.js";
export default async function authRoutes(fastify) {
    fastify.post("/login", async (request, reply) => {
        try {
            const { username, password } = request.body || {};
            if (!username || !password) {
                return reply
                    .code(400)
                    .send({ error: "Username and password required" });
            }
            const admin = await Admin.findOne({ where: { username } });
            if (!admin) {
                return reply.code(401).send({ error: "Invalid credentials" });
            }
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) {
                return reply.code(401).send({ error: "Invalid credentials" });
            }
            const token = jwt.sign({
                id: admin.id,
                username: admin.username,
                role: admin.role || "admin",
            }, JWT_SECRET, { expiresIn: "4h" });
            return reply.send({
                ok: true,
                token,
                role: admin.role || "admin",
            });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({
                error: "Login failed",
                details: err.message,
            });
        }
    });
}
