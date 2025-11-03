const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export { JWT_SECRET };