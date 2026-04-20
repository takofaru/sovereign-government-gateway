import * as StellarSdk from 'stellar-sdk';
import { isConnected, getAddress, signTransaction } from '@stellar/freighter-api';
import { Buffer } from 'buffer';

const CONTRACT_ID = "CCB..."; // Replace with deployed contract ID
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";

const server = new StellarSdk.rpc.Server(RPC_URL);

/**
 * Submits a survey stage response to the Soroban contract.
 */
export async function submitStage(
  surveyId: number,
  stageId: number,
  responseHash: string, // 32-byte hex string
  issuerSignature: string // 64-byte hex string (mock signature for proof-of-humanity)
) {
  if (!(await isConnected())) {
    throw new Error("Freighter not connected");
  }

  const { address: publicKey } = await getAddress();
  if (!publicKey) throw new Error("Could not get public key");

  const userAccount = await server.getAccount(publicKey);

  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(userAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "submit_stage_response",
        StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(surveyId.toString())),
        StellarSdk.xdr.ScVal.scvU32(stageId),
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
 * Fetches survey metadata from the contract.
 */
export async function getSurveyInfo(surveyId: number) {
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
