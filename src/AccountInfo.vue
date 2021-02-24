<template>
  <div>
    <h2>Account Info</h2>
    <div>
      path: 44/118/0/0/<input v-model="ledgerIndex">
    </div>
    <div>
      Address: {{address}}<button @click="fetchCosmosInfo">Read address</button>
    </div>
    <div>
      Account number: {{accountNumber}}
    </div>
    <div>
      Sequence: {{sequence}}
    </div>
    <div>
      Balance: {{balance}}
    </div>
    <button @click="fetchCosmosInfo">re-read account</button>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { FETCH_COSMOS_INFO } from './store.js';

function prettyBalance(coins) {
  if (!coins) {
    return 'N/A';
  }
  const coin = coins.find((coin) => coin.denom === 'nanolike');
  if (!coin) {
    return 'N/A';
  }
  const amount = Number.parseInt(coin.amount, 10) / 1e9;
  return `${amount.toFixed(4)} LIKE`;
}

export default {
  setup() {
    const store = useStore();
    let ledgerIndex = ref(0);
    return {
      ledgerIndex,
      address: computed(() => store.state.addressInfo.address),
      accountNumber: computed(() => store.state.accountInfo.accountNumber),
      balance: computed(() => prettyBalance(store.state.accountInfo.coins)),
      sequence: computed(() => store.state.accountInfo.sequence),
      fetchCosmosInfo: () => store.dispatch(FETCH_COSMOS_INFO, Number.parseInt(ledgerIndex.value, 10)),
    };
  },
};

</script>

