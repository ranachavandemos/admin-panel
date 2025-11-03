import { ApprovalRequest, MISStudent, MISTeacher, AuditTrail, } from "../models/index.js";
export default async function approvalsRoutes(fastify) {
    fastify.get("/approvals/pending", async (_request, reply) => {
        const list = await ApprovalRequest.findAll({
            where: { status: "Pending" },
            order: [["requested_at", "DESC"]],
            limit: 2000,
        });
        return reply.send(list);
    });
    fastify.post("/approvals/:id/approve", { preHandler: fastify.authenticate }, async (request, reply) => {
        try {
            const id = Number(request.params.id);
            const reqRec = await ApprovalRequest.findByPk(id);
            if (!reqRec)
                return reply.code(404).send({ error: "Not found" });
            if (reqRec.status !== "Pending")
                return reply.code(400).send({ error: "Already processed" });
            const user = request.user || {};
            if (user.role !== "admin")
                return reply.code(403).send({ error: "Forbidden" });
            const payload = reqRec.payload || {};
            const source = (reqRec.source_type || "").toLowerCase();
            let inserted;
            if (source === "student") {
                inserted = await MISStudent.create({
                    name: payload.Name || payload.name,
                    class: payload.Class || payload.class,
                    academic_year: payload.Academic_Year || payload.academic_year,
                    student_id: payload.Student_ID || payload.student_id,
                    school_code: payload.School_Code || payload.school_code,
                    status: "Approved",
                    created_by: user.username || "system",
                });
            }
            else if (source === "teacher") {
                inserted = await MISTeacher.create({
                    name: payload.Name || payload.name,
                    teacher_id: payload.Teacher_ID || payload.teacher_id,
                    academic_year: payload.Academic_Year || payload.academic_year,
                    school_code: payload.School_Code || payload.school_code,
                    designation: payload.Designation || payload.designation,
                    status: "Approved",
                    created_by: user.username || "system",
                });
            }
            else {
                return reply.code(400).send({ error: "Invalid source_type" });
            }
            reqRec.status = "Approved";
            reqRec.approved_by = user.username || "system";
            reqRec.approved_at = new Date();
            await reqRec.save();
            await AuditTrail.create({
                entity_type: source,
                entity_id: inserted?.id || reqRec.id,
                action: "APPROVED",
                performed_by: user.username || "system",
                details: {
                    approved_by: user.username,
                    source_type: reqRec.source_type,
                    payload,
                },
                created_at: new Date(),
            });
            return reply.send({
                ok: true,
                message: "Record approved successfully.",
            });
        }
        catch (err) {
            fastify.log.error(err);
            if (err.name === "SequelizeUniqueConstraintError") {
                const field = err.errors?.[0]?.path || "unknown field";
                const value = err.errors?.[0]?.value || "unknown value";
                return reply.code(409).send({
                    error: "Duplicate entry",
                    details: `${field} '${value}' already exists.`,
                });
            }
            if (err.name === "SequelizeValidationError") {
                return reply.code(400).send({
                    error: "Validation failed",
                    details: err.errors.map((e) => e.message),
                });
            }
            return reply.code(500).send({
                error: "Approval failed",
                details: err.message,
            });
        }
    });
    fastify.post("/approvals/:id/reject", { preHandler: fastify.authenticate }, async (request, reply) => {
        try {
            const id = Number(request.params.id);
            const reqRec = await ApprovalRequest.findByPk(id);
            if (!reqRec)
                return reply.code(404).send({ error: "Not found" });
            if (reqRec.status !== "Pending")
                return reply.code(400).send({ error: "Already processed" });
            const user = request.user || {};
            if (user.role !== "admin")
                return reply.code(403).send({ error: "Forbidden" });
            const { remarks } = request.body || {};
            reqRec.status = "Rejected";
            reqRec.remarks = remarks || "Rejected by admin";
            reqRec.approved_by = user.username || "system";
            reqRec.approved_at = new Date();
            await reqRec.save();
            await AuditTrail.create({
                entity_type: "approval_request",
                entity_id: reqRec.id,
                action: "REJECTED",
                performed_by: user.username || "system",
                details: { remarks: remarks || "Rejected by admin" },
                created_at: new Date(),
            });
            return reply.send({
                ok: true,
                message: "Record rejected successfully.",
            });
        }
        catch (err) {
            fastify.log.error(err);
            if (err.name === "SequelizeValidationError") {
                return reply.code(400).send({
                    error: "Validation failed",
                    details: err.errors.map((e) => e.message),
                });
            }
            return reply.code(500).send({
                error: "Reject failed",
                details: err.message,
            });
        }
    });
}
