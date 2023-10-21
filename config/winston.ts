import winston from "winston";
import appRoot from "app-root-path";
import { StreamOptions } from "morgan";

const options = {
  File: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    format: winston.format.json(),
    maxsize: 5000000, //5MB
    maxFile: 5
  },
  console: {
    level: "debug",
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.File),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false
});

export const morganStream: StreamOptions = {
  write: (message) => {
    logger.info(message.trim());
  }
};
