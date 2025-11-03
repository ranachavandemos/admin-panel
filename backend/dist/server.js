import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import uploadRoutes from "./routes/upload.js";
import approvalsRoutes from "./routes/approvals.js";
import misRoutes from "./routes/mis.js";
import authRoutes from "./routes/auth.js";
import auditRoutes from "./routes/audit.js";
import { connectDB } from "./plugins/db.js";
import { JWT_SECRET } from "./config.js";
const app = Fastify({ logger: true });
await app.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});
await app.register(fastifyMultipart, {
    attachFieldsToBody: false,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
await app.register(fastifyJwt, {
    secret: JWT_SECRET,
});
app.decorate("authenticate", async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.code(401).send({ error: "Unauthorized" });
    }
});
app.decorate("optionalAuth", async (req, _reply) => {
    try {
        await req.jwtVerify();
    }
    catch {
        req.user = { username: "guest", role: "teacher" };
    }
});
await connectDB();
app.log.info(" MySQL connected successfully");
await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(misRoutes, { prefix: "/api/mis" });
await app.register(approvalsRoutes, { prefix: "/api" });
await app.register(uploadRoutes, { prefix: "/api" });
await app.register(auditRoutes, { prefix: "/api" });
try {
    await app.listen({ port: 3002, host: "0.0.0.0" });
    console.log(" Server running at http://localhost:3002");
}
catch (err) {
    app.log.error(err);
    process.exit(1);
}
