import ThresholdKey from "@tkey/core";
import SFAServiceProvider from "@tkey/service-provider-sfa";
import TorusStorageLayer from "@tkey/storage-layer-torus";

const clientId =
  "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io/

export const chainConfig = {
  chainId: "0x1",
  rpcTarget: "https://rpc.ankr.com/eth",
  displayName: "mainnet",
  blockExplorer: "https://etherscan.io/",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const web3AuthOptions: any = {
  clientId, // Get your Client ID from Web3Auth Dashboard
  chainConfig,
  web3AuthNetwork: "sapphire_mainnet",
};

// Configuration of Service Provider
const serviceProvider = new SFAServiceProvider({ web3AuthOptions });

// Instantiation of Storage Layer
const storageLayer = new TorusStorageLayer({
  hostUrl: "https://metadata.tor.us",
});

// Instantiation of tKey
export const tkey = new ThresholdKey({
  serviceProvider,
  storageLayer,
});

export const newtKey = new ThresholdKey({
  serviceProvider,
  storageLayer,
});
