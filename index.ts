import ThresholdKey from "@tkey/core";
import { ShareStore } from "@tkey/common-types";
import { TorusStorageLayer } from "@tkey/storage-layer-torus";
import { SfaServiceProvider } from "@tkey/service-provider-sfa";
import jwt from "jsonwebtoken";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Torus from "@toruslabs/torus.js";
import BN from "bn.js";
import { tkey, newtKey, chainConfig } from "./tkey";

function parseToken(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(atob(base64 || ""));
}

const privateKey =
  "MEECAQAwEwYHKoZIzj0CAQYIKoZIzj0DAQcEJzAlAgEBBCCD7oLrcKae+jVZPGx52Cb/lKhdKxpXjl9eGNa1MlY57A==";
const jwtPrivateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
const alg: jwt.Algorithm = "ES256";

export const mockLogin = async (email: string) => {
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "torus-key-test",
    aud: "torus-key-test",
    name: email,
    email,
    scope: "email",
    iat,
    eat: iat + 120,
  };

  const algo = {
    expiresIn: 120,
    algorithm: alg,
  };

  const token = jwt.sign(payload, jwtPrivateKey, algo);
  const idToken = token;
  const parsedToken = parseToken(idToken);
  return { idToken, parsedToken };
};

async function main() {
  let { idToken, parsedToken } = await mockLogin(
    `anch${Math.floor(Math.random() * 10) + 1}drrecvY`
  );
  let verifier = "torus-test-health";
  let verifierId = parsedToken.email;

  const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
      chainConfig,
    },
  });

  await (tkey.serviceProvider as SfaServiceProvider).init(
    ethereumPrivateKeyProvider
  );

  await (tkey.serviceProvider as SfaServiceProvider).connect({
    verifier,
    verifierId,
    idToken,
  });

  // First time login or initialize()
  let keyDetails = await tkey.initialize();
  // console.log(keyDetails);
  let result1 = await tkey.reconstructKey();
  // console.log(result1);
  // console.log("privKey", tkey.privKey);

  let shareDetail = await tkey.generateNewShare();
  let shareStore = await tkey.outputShareStore(shareDetail.newShareIndex);
  let shareStoreString = shareStore.toJSON();
  // save shareStoreString to database

  let shareDetail2 = await tkey.generateNewShare();
  let shareStore2 = await tkey.outputShareStore(shareDetail2.newShareIndex);
  let shareStoreString2 = shareStore2.toJSON();
  // save shareStoreString2 to another server and fetch it via secure API

  // ReLogin
  let newTkey = newtKey;

  let newKeyDetails = await newTkey.initialize();
  // load shareStoreString from database
  let shareStorefromJson = ShareStore.fromJSON(shareStoreString);
  await newTkey.inputShareStore(shareStorefromJson);
  // load shareStoreString2 from another server via secure API
  let shareStore2fromJson = ShareStore.fromJSON(shareStoreString2);
  await newTkey.inputShareStore(shareStore2fromJson);

  let result2 = await newTkey.reconstructKey();
  // console.log(result2);
  console.log("privKey new instance: ", newTkey.privKey);
  process.exit(0);
}
main();
