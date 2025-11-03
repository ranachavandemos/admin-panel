import "fastify";
import { FastifyJWT } from "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: { username?: string; role?: string };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number; username?: string; role?: string };
    user: { id: number; username?: string; role?: string };
  }
}
