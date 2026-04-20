import * as StellarSdk from 'stellar-sdk';
import { isConnected, getAddress, signTransaction, getNetworkDetails } from '@stellar/freighter-api';
import { Buffer } from 'buffer';

const CONTRACT_ID = "CCB..."; // Placeholder - Needs actual deployed address
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

/**
 * Submits a survey response to the Soroban contract.
 */
export async function submitResponse(
  surveyId: number,
  responseHash: string, // 32-byte hex string
  issuerSignature: string // 64-byte hex string
) {
  const connected = await isConnected();
  if (!connected || !connected.isConnected) {
    throw new Error("Freighter not connected. Please check your extension.");
  }

  const netDetails = await getNetworkDetails();
  if (netDetails.network !== "TESTNET") {
    throw new Error(`Wallet is on ${netDetails.network}, but this app requires TESTNET.`);
  }

  const addressObj = await getAddress();
  const publicKey = addressObj.address;
  if (!publicKey) throw new Error("Could not retrieve wallet address.");

  // Dynamically fetch RPC URL from Freighter if available, else default to testnet
  const RPC_URL = netDetails.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
  const server = new StellarSdk.rpc.Server(RPC_URL);

  const userAccount = await server.getAccount(publicKey);

  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(userAccount, {
    fee: "1000", // Increased fee for Soroban
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "submit_response",
        StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(surveyId.toString())),
        StellarSdk.Address.fromString(publicKey).toScVal(),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(responseHash, 'hex')),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(issuerSignature, 'hex'))
      )
    )
    .setTimeout(30)
    .build();

  const signResult = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
  const signedTxXdr = (signResult as any).signedTxXdr || signResult;
  
  const result = await server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction);
  
  return result;
}

/**
 * Fetches user reputation score from the contract.
 */
export async function getReputation(publicKey: string): Promise<number> {
  try {
    const netDetails = await getNetworkDetails();
    const RPC_URL = netDetails.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
    const server = new StellarSdk.rpc.Server(RPC_URL);

    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const tx = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account("GDBU6UCOOT6RRYA6J4W5J37TCO5I5V5COVDR3LIPYUC37WSXSTCHVAYE", "0"),
      { fee: "0", networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call("get_reputation", StellarSdk.Address.fromString(publicKey).toScVal()))
      .build();

    const simulation = await server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const val = simulation.result.retval;
      return val.u32();
    }
    return 0;
  } catch (err) {
    console.warn("Failed to fetch reputation from contract, defaulting to 0", err);
    return 0;
  }
}

/**
 * Fetches survey metadata from the contract.
 */
export async function getSurveyInfo(surveyId: number) {
  const netDetails = await getNetworkDetails();
  const RPC_URL = netDetails.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
  const server = new StellarSdk.rpc.Server(RPC_URL);

  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account("GDBU6UCOOT6RRYA6J4W5J37TCO5I5V5COVDR3LIPYUC37WSXSTCHVAYE", "0"),
    { fee: "0", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_survey_info", StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(surveyId.toString()))))
    .build();

  const result = await server.simulateTransaction(tx);
  return result;
}
