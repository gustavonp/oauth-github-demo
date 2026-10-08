import "dotenv/config";
import express from "express";
import session from "express-session";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";
import apiRouter from "./routes/api.js";

const app = express();
const isProdEnvironment = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProdEnvironment,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use("/auth", authRouter);

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});