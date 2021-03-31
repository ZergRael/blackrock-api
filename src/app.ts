import dotenv from "dotenv";
dotenv.config();
import log from "./logger";
import wclogs from "./wclogs";
import restify from "restify";
import errors from "restify-errors";

async function run() {
  log.silly("Hello");

  const server = restify.createServer({
    name: "blackrock",
  });

  server.get("/:code", async function (req, res, next) {
    const code = req.params.code;
    log.info(`GET ${code}`);

    if (!wclogs.validateCode(code)) {
      return next(new errors.NotFoundError("Invalid code"));
    }

    const buffsAndConsummables = await wclogs.getBuffsAndConsummables(code);
    res.send(buffsAndConsummables);

    return next();
  });

  server.listen(8081, function () {
    log.info("Listen", server.name, server.url);
  });

  log.silly("Bye");
}

run();
