<template>
  <div>
    <div>
      path: 44/118/0/0/<input v-model="ledgerIndex">
    </div>
    <div>
      Address: {{ledgerAddress}}<button @click="readLedger">Read address</button>
    </div>
    <div>
      Account number: {{account.account_number}}
    </div>
    <div>
      Sequence: {{account.sequence}}
    </div>
    <div>
      Balance: {{balancePretty}}
    </div>
    <button @click="readAccount">re-read account</button>
    <div>
      Send to address: <input v-model.trim="sendToAddress">
    </div>
    <div>
      Value: <input v-model="sendValueInput"> LIKE
    </div>
    <div>
      Memo (optional): <input v-model="sendMemo">
    </div>
    <div>
      Sign message: {{signMessage}}
    </div>
    <button @click="generateSignMessage">Generate sign message</button>
    <button @click="sign">Sign</button>
    <div>
      Signature: {{signature}}
    </div>
    <button @click="sendSigned">Confirm and Send</button>
    <div>
      TxHash: {{sentTxHash}}
    </div>
    <div>
      Error message: {{error}}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import CosmosApp from "ledger-cosmos-js";
import sha256 from "crypto-js/sha256";
import ripemd160 from "crypto-js/ripemd160";
import CryptoJS from "crypto-js";
import bech32 from "bech32";
import jsonStringify from 'fast-json-stable-stringify';
import { Base64 } from 'js-base64';

const LCD_ENDPOINT = 'https://likecoin.nnkken.dev';
const CHAIN_ID = 'likecoin-chain-sheungwan';

function sigDerToRaw(sig) {
  if (sig.length === 64) {
    return Base64.encode(sig);
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
  console.log(rawSig);
  i += 32;
  if (sig[i] !== 0x02) {
    throw new Error(`Ecpect signature S value header with tag 0x02, got ${sig[i].toString(16).padStart(2, '0')}`);
  }
  const sLength = sig[i + 1];
  i += 2;
  i += sLength - 32;
  rawSig.set(sig.subarray(i, i + 32), 32);
  console.log(rawSig);
  return Base64.encode(rawSig);
}

export default Vue.extend({
  data() {
    return {
      ledgerIndex: '0',
      ledgerAddress: '',
      pubKeyRes: {},
      account: {},
      transport: null,
      cosmosLedgerApp: null,
      sendToAddress: '',
      sendValueInput: '0',
      sendMemo: '',
      signature: '',
      sentTxHash: '',
      signMessage: '',
      baseSignObj: {},
      error: '',
    };
  },
  computed: {
    path() {
      return [44,  118, 0, 0, Number.parseInt(this.ledgerIndex, 10)];
    },
    balancePretty() {
      if (!this.account || !this.account.coins) {
        return 'N/A';
      }
      const coin = this.account.coins.find((coin) => coin.denom === 'nanolike');
      if (!coin) {
        return 'N/A';
      }
      const amount = Number.parseInt(coin.amount, 10) / 1e9;
      return `${amount.toFixed(4)} LIKE`;
    },
  },
  methods: {
    async initLedger() {
      if (!this.transport) {
        this.transport = await TransportWebUSB.create();
      }
      if (!this.cosmosLedgerApp) {
        this.cosmosLedgerApp = new CosmosApp(this.transport);
      }
    },
    async readLedger() {
      await this.initLedger();
      this.pubKeyRes = await this.cosmosLedgerApp.publicKey(this.path);
      const message = CryptoJS.enc.Hex.parse(this.pubKeyRes.compressed_pk.toString('hex'));
      const hash = ripemd160(sha256(message)).toString();
      const addressRawHex = Buffer.from(hash, 'hex');
      const words = bech32.toWords(addressRawHex);
      this.ledgerAddress = bech32.encode('cosmos', words);
      this.readAccount();
    },
    async readAccount() {
      const res = await axios.get(`/auth/accounts/${this.ledgerAddress}`, {
        baseURL: LCD_ENDPOINT,
      });
      this.account = res.data.result.value;
    },
    generateSignMessage() {
      this.baseSignObj = {
        fee: {
          amount: [
            {
              denom: 'nanolike',
              amount: '44000000',
            },
          ],
          gas: '44000',
        },
        msgs: [{
          type: 'cosmos-sdk/MsgSend',
          value: {
            from_address: this.ledgerAddress,
            to_address: this.sendToAddress,
            amount: [
              {
                denom: 'nanolike',
                amount: (Number.parseFloat(this.sendValueInput) * 1e9).toFixed(),
              }
            ]
          }
        }],
        chain_id: CHAIN_ID,
        account_number: this.account.account_number,
        sequence: this.account.sequence,
        memo: this.sendMemo,
      };
      this.signMessage = jsonStringify(this.baseSignObj);
    },
    async sign() {
      await this.initLedger();
      const res = await this.cosmosLedgerApp.sign(this.path, this.signMessage);
      console.log(res);
      this.signature = sigDerToRaw(res.signature);
    },
    async sendSigned() {
      this.error = '';
      const tx = {
        mode: 'sync',
        tx: {
          ...this.baseSignObj,
          msg: this.baseSignObj.msgs,
          signatures: [{
            signature: this.signature,
            pub_key: {
              type: 'tendermint/PubKeySecp256k1',
              value: Base64.encode(this.pubKeyRes.compressed_pk),
            },
          }],
        },
      };
      delete tx.msgs;
      const res = await axios.post('/txs', tx, {
        baseURL: LCD_ENDPOINT,
      });
      console.log(res);
      this.sentTxHash = res.data.txhash;
      if (res.code) {
        this.error = res.raw_log;
        return;
      }
    },
  },
});

</script>
