<template>
  <div>
    <h2>Tx Info</h2>
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
    <div>
      Sign object: {{signObject}}
    </div>
    <button @click="sign">Sign</button>
    <div>
      Signature: {{signature}}
    </div>
    <button @click="broadcastTx">Confirm and Send</button>
    <div>
      TxHash: <a :href="txLink" target="_blank">{{txHash}}</a>
    </div>
    <div>
      Log message: {{log}}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { LCD_ENDPOINT, CHAIN_ID } from './config.js';
import * as Cosmos from './cosmos.js';

export default {
  setup() {
    const store = useStore();
    const memo = ref('');
    const gas = ref(0);
    const recommendedGas = computed(() => Cosmos.computeTotalGas(store.state.msgs));
    watch(recommendedGas, (recommendedGas) => {
      gas.value = recommendedGas;
    });
    const gasPrice = ref(100);
    const fee = computed(() => `${gas.value * gasPrice.value / 1e9} LIKE`);
    const signObject = computed(() => {
      const { msgs } = store.state;
      const { accountNumber, sequence } = store.state.accountInfo;
      return Cosmos.prepareSignObject({
        msgs,
        chainID: CHAIN_ID,
        accountNumber,
        sequence,
        gas: gas.value,
        gasPrice: gasPrice.value,
        memo: memo.value,
      });
    });
    const signature = ref('');
    const txHash = ref('');
    const txLink = computed(() => `https://likecoin.bigdipper.live/transactions/${txHash.value}?new`);
    const log = ref(null);
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
      txLink,
      log,
      sign,
      broadcastTx,
    };
  },
};

</script>
