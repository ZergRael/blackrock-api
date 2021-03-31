import { AccessToken, ClientCredentials } from "simple-oauth2";
import { promises as fs } from "fs";
import log from "./logger";

const TOKEN_FILE = "./token.json";
const EXPIRATION_THRESHOLD = 10;

if (!process.env.CLIENT_ID) {
  throw new Error("Missing .env CLIENT_ID");
}
if (!process.env.CLIENT_SECRET) {
  throw new Error("Missing .env CLIENT_SECRET");
}

let token: AccessToken = null;

const config = {
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://www.warcraftlogs.com/oauth/token",
  },
};

async function readTokenFromFile(): Promise<AccessToken> {
  log.debug("Reading token from file");

  try {
    const byteToken = await fs.readFile(TOKEN_FILE);
    log.debug("Found token");

    const client = new ClientCredentials(config);
    return client.createToken(JSON.parse(byteToken.toString()));
  } catch (err) {
    log.error("Failed to readTokenFromFile", err);
  }

  return null;
}
async function writeTokenToFile(token: AccessToken) {
  log.debug("Writing token to file", token);

  await fs.writeFile(TOKEN_FILE, JSON.stringify(token));
}

async function generateToken(): Promise<AccessToken> {
  log.info("Generating a new token");
  const client = new ClientCredentials(config);
  const tokenParams = {
    // scope: "client_credentials"
  };

  return await client.getToken(tokenParams);
}

async function getToken(): Promise<String> {
  if (!token) {
    token = await readTokenFromFile();

    if (!token || token.expired(EXPIRATION_THRESHOLD)) {
      token = await generateToken();
      writeTokenToFile(token);
    }
  }

  if (token.expired(EXPIRATION_THRESHOLD)) {
    token = await token.refresh();
  }

  // log.debug("Using token", token);

  return token.token.access_token;
}

export { getToken };
