import winston from "winston";

const log = winston.createLogger({
  level: process.env.NODE_ENV !== "production" ? "debug" : "info",
  transports: [new winston.transports.Console()],
});

export default log;
