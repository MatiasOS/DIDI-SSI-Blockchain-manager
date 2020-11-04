const Constants = require("./constants/Constants");
const { BlockchainManager } = require("../src/BlockchainManager");
const { Credentials } = require("uport-credentials");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let blockchainManager;
let jwt;
let payload;
let signer;
let identity;
let createdCredential;

const personData = {
  dni: 12345678,
  names: "Homero",
  lastNames: "Simpson",
  nationality: "Argentina"
};

const subject = {
  DatosPersonales: {
    preview: {
      fields: ["dni", "names", "lastNames", "nationality"],
      type: 2,
    },
    category: "identity",
    data: personData,
  },
};

let aYearFromNow = new Date();
aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

function initializeBlockchainManager() {
  blockchainManager = new BlockchainManager(config);
}

async function createJWT(didWithPrefix) {  
  signer = blockchainManager.getSigner(identity.privateKey);
  payload = { name: "TEST" };
  jwt = await blockchainManager.createJWT(didWithPrefix, identity.privateKey, {
    ...payload,
  });
}


function createIdentities() {
  return Credentials.createIdentity();
}

function addPrefix(prefixToAdd, did) {
  const prefixDid = did.slice(0, 9) + prefixToAdd + did.slice(9, did.length);
  return prefixDid;
}

beforeEach(async () => {
  initializeBlockchainManager();
  identity = createIdentities();  
});

describe("Blockchain Manager JWT should", () => {
  it("create a jwt with lacchain prefix", async () => {
    const didWithPrefix = addPrefix('lacchain:', identity.did);
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.jwt).toEqual(jwt);
  });


  it("match jwt string", async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.jwt).toEqual(jwt);
  });

  it("contain the payload", async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.payload).toEqual(expect.objectContaining(payload));
  });

  it("have the did as the issuer", async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.issuer).toEqual(identity.did);
  });

  it("have the same payload", async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method", async () => {
    const result = await blockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

// describe("Blockchain Manager Credentials should", () => {
//   it("create a Credential invoking createCertificate method with lacchain did ", async () => {
//     const didWithPrefix = addPrefix('lacchain:', identity.did);
//     const result = await blockchainManager.createCertificate(      
//       didWithPrefix,
//       subject,
//       aYearFromNow,
//       process.env.DELEGATOR_DID,
//       process.env.DELEGATOR_PRIV_KEY,
//       Constants.CREDENTIALS
//     );
//     createdCredential = result;
//     expect(result).toBeDefined();    
//   });

//   it("verify a created Credential invoking verifyCertificate method", async () => {
//     const result = await blockchainManager.verifyCertificate(createdCredential);
//     console.log('\n\nresult :>> ', JSON.stringify(result, 0, 3));
//     expect(result).toBeDefined();
//     expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(personData.dni);
//   });
// });
