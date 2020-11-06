const Constants = require("./constants/Constants");
const { BlockchainManager } = require("../src/BlockchainManager");
const { Credentials } = require("uport-credentials");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let blockchainManager;
const issuerIdentity = {
  did: process.env.TEST_ISSUER_DID,
  privateKey: process.env.TEST_ISSUER_PRIV_KEY,
};

let delegateIdentity;
let delegateTx;

function initializeBlockchainManager() {
  blockchainManager = new BlockchainManager(config);
}

function createIdentities() {
  delegateIdentity = Credentials.createIdentity();
}

function addPrefix(prefixToAdd, did) {
  const prefixDid = did.slice(0, 9) + prefixToAdd + did.slice(9, did.length);
  return prefixDid;
}

async function addDelegation(prefixToAdd) {
  const did = delegateIdentity.did;
  const withPrefixDid = addPrefix(prefixToAdd, did);

  delegateTx = blockchainManager.addDelegate(
    issuerIdentity,
    withPrefixDid,
    1000
  );
  return delegateTx;
}

describe.only("BlockchainManager Delegation", () => {
  describe("On ANY blochchain should", () => {
    beforeAll(async () => {
      initializeBlockchainManager();
      createIdentities();
    });


    it("be able to addDelegate", async () => {
      const t0 = addDelegation("");
      const t1 = addDelegation("rsk:");
      const t2 = addDelegation("lacchain:");
      const t3 = addDelegation("bfa:");

      const a = await Promise.all([t0, t1, t2, t3]);
      console.dir(a[0]);
      console.dir(a[1]);
      console.dir(a[2]);
      console.dir(a[3]);
    });
  });
});