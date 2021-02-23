<template>
  <div>
    <div>
      Memo (optional): <input v-model="memo">
    </div>
    <div>
      Gas: <input v-model.trim.number="gas"> (Recommend: {{recommendedGas}})
    </div>
    <div>
      Gas Price: <input v-model.trim.number="gasPrice">
    </div>
    <div>
      Fee: {{fee}}
    </div>
    <button @click="prepareSignObject">Prepare sign object</button>
    <div>
      Sign object: {{signObject}}
    </div>
    <button @click="sign">Sign</button>
    <div>
      Signature: {{signature}}
    </div>
    <button @click="broadcastTx">Confirm and Send</button>
    <div>
      TxHash: {{txHash}}
    </div>
    <div>
      Log message: {{log}}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { LCD_ENDPOINT, CHAIN_ID } from './config.js';
import * as Cosmos from './cosmos.js';

export default {
  setup() {
    const store = useStore();
    const memo = ref('');
    const gas = ref(200000);
    const recommendedGas = computed(() => Cosmos.computeTotalGas(store.state.msgs));
    const gasPrice = ref(100);
    const fee = computed(() => `${gas.value * gasPrice.value / 1e9} LIKE`);
    const signObject = ref({});
    const signature = ref('');
    const txHash = ref('');
    const log = ref(null);
    const prepareSignObject = () => {
      const { msgs } = store.state;
      const { accountNumber, sequence } = store.state.accountInfo;
      signObject.value = Cosmos.prepareSignObject({
        msgs,
        chainID: CHAIN_ID,
        accountNumber,
        sequence,
        gas: gas.value,
        gasPrice: gasPrice.value,
        memo: memo.value,
      });
    };
    const sign = async () => {
      const { cosmosLedgerApp } = store.state;
      const { ledgerPath } =  store.state.addressInfo;
      signature.value = await Cosmos.sign(cosmosLedgerApp, signObject.value, ledgerPath)
    }
    const broadcastTx = async () => {
      const resData = await Cosmos.broadcastTx({
        signObject: signObject.value,
        signature: signature.value,
        pubKey: store.state.addressInfo.pubKey,
        endpoint: LCD_ENDPOINT,
      });
      txHash.value = resData.txhash
      log.value = resData.raw_log;
    }
    return {
      memo,
      gas,
      gasPrice,
      recommendedGas,
      fee,
      signObject,
      signature,
      txHash,
      log,
      prepareSignObject,
      sign,
      broadcastTx,
    };
  },
};

</script>
