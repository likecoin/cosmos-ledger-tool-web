import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import CosmosApp from "ledger-cosmos-js";
import CryptoJS from "crypto-js";
import sha256 from "crypto-js/sha256";
import ripemd160 from "crypto-js/ripemd160";
import { Base64 } from "js-base64";
import { bech32 } from 'bech32';
import axios from 'axios';
import jsonStringify from 'fast-json-stable-stringify';

export async function readAddressInfo(cosmosLedgerApp, {
  path = getLedgerPath(0),
  prefix = 'cosmos',
}) {
  const { compressed_pk } = await cosmosLedgerApp.publicKey(path);
  const message = CryptoJS.enc.Hex.parse(compressed_pk.toString('hex'));
  const hash = ripemd160(sha256(message)).toString();
  const addressRawHex = Buffer.from(hash, 'hex');
  const words = bech32.toWords(addressRawHex);
  const address = bech32.encode(prefix, words);
  return {
    pubKey: {
      type: 'tendermint/PubKeySecp256k1',
      value: Base64.encode(compressed_pk),
    },
    address,
  };
}

export async function fetchAccountInfo(endpoint, address) {
  const res = await axios.get(`/auth/accounts/${address}`, {
    baseURL: endpoint,
  });
  const { coins, account_number: accountNumber, sequence } = res.data.result.value;
  return { address, coins, accountNumber, sequence };
}

export function computeTotalGas(msgs) {
  const GAS = {
    'cosmos-sdk/MsgSend': 44000,
    'cosmos-sdk/MsgDelegate': 130000,
    'cosmos-sdk/MsgBeginRedelegate': 220000,
    'cosmos-sdk/MsgUndelegate': 145000,
    'cosmos-sdk/MsgWithdrawDelegationReward': 90000,
  };
  return msgs.reduce((sum, msg) => sum + GAS[msg.type], 0);
}

export function prepareSignObject({
  msgs,
  chainID,
  accountNumber,
  sequence,
  gas = 200000,
  gasPrice = 100,
  memo = '',
  denom = 'nanolike',
}) {
  const gasAmount = gas.toString();
  const feeAmount = (gas * gasPrice).toString();
  return {
    fee: {
      amount: [{ denom, amount: feeAmount }],
      gas: gasAmount,
    },
    msgs,
    chain_id: chainID,
    account_number: accountNumber,
    sequence: sequence,
    memo: memo,
  };
}

export async function sign(cosmosLedgerApp, signObj, path = getLedgerPath(0)) {
  const signMsg = jsonStringify(signObj);
  console.log(signMsg);
  const res = await cosmosLedgerApp.sign(path, signMsg);
  return sigDerToRaw(res.signature);
}

export function createMsgSend({
  from, to, amount, denom = 'nanolike',
}) {
  return {
    type: 'cosmos-sdk/MsgSend',
    value: {
      from_address: from,
      to_address: to,
      amount: [
        {
          denom,
          amount: amount.toFixed(),
        }
      ]
    }
  }
}

export function createMsgDelegate({
  delegator, validator, amount, denom = 'nanolike',
}) {
  return {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      delegator_address: delegator,
      validator_address: validator,
      amount: {
        denom,
        amount: amount.toFixed(),
      }
    }
  }
}

export function createMsgBeginRedelegate({
  delegator, fromValidator, toValidator, amount, denom = 'nanolike',
}) {
  return {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      amount: {
        denom,
        amount: amount.toFixed(),
      },
      delegator_address: delegator,
      validator_src_address: fromValidator,
      validator_dst_address: toValidator,
    }
  };
}

export function createMsgUndelegate({
  delegator, validator, amount, denom = 'nanolike',
}) {
  return {
    type: 'cosmos-sdk/MsgUndelegate',
    value: {
      amount: {
        denom,
        amount: amount.toFixed(),
      },
      delegator_address: delegator,
      validator_address: validator,
    }
  };
}

export function createMsgWithdrawDelegationReward({ delegator, validator }) {
  return {
    type: 'cosmos-sdk/MsgWithdrawDelegationReward',
    value: {
      delegator_address: delegator,
      validator_address: validator,
    }
  };
}

export async function broadcastTx({ signObject, signature, pubKey, endpoint }) {
  const tx = {
    mode: 'sync',
    tx: {
      ...signObject,
      msg: signObject.msgs,
      signatures: [{ signature, pub_key: pubKey }],
    },
  };
  delete tx.msgs;
  console.log(tx);
  const res = await axios.post('/txs', tx, {
    baseURL: endpoint,
  });
  console.log(res);
  return res.data;
}

export async function initCosmosLedgerApp() {
  const transport = await TransportWebUSB.create();
  return new CosmosApp(transport);
}

export function getLedgerPath(index) {
  return [44, 118, 0, 0, index];
}

function sigDerToRaw(sig) {
  if (sig.length === 64) {
    console.log(rawSig);
    return Base64.fromUint8Array(sig);
  }
  const rawSig = new Uint8Array(64);
  if (sig[0] !== 0x30) {
    throw new Error(`Ecpect signature header with tag 0x30, got ${sig[0].toString(16).padStart(2, '0')}`);
  }
  let i = 2;
  if (sig[i] !== 0x02) {
    throw new Error(`Ecpect signature R value header with tag 0x02, got ${sig[i].toString(16).padStart(2, '0')}`);
  }
  const rLength = sig[i + 1];
  i += 2;
  i += rLength - 32;
  rawSig.set(sig.subarray(i, i + 32), 0);
  i += 32;
  if (sig[i] !== 0x02) {
    throw new Error(`Ecpect signature S value header with tag 0x02, got ${sig[i].toString(16).padStart(2, '0')}`);
  }
  const sLength = sig[i + 1];
  i += 2;
  i += sLength - 32;
  rawSig.set(sig.subarray(i, i + 32), 32);
  return Base64.fromUint8Array(rawSig);
}
