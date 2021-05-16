<template>
  <div>
    <h2>Account Info</h2>
    <div class="path-container">
      path: 44/118/<input v-model.number="ledgerIndex0" type="number">/<input v-model.number="ledgerIndex1" type="number">/<input v-model.number="ledgerIndex2" type="number">
    </div>
    <div>
      Address: {{address}}<button @click="updateLedgerPath">Read address</button>
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
    <div>
      Delegations:
      <ul>
        <li v-for="delegation in delegations" v-bind:key="delegation.id">
          {{delegation}}
        </li>
      </ul>
    </div>
    <button @click="updateLedgerPath">re-read account</button>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { UPDATE_LEDGER_PATH } from './store.js';
import { getLedgerPath } from './cosmos.js';

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
    const ledgerIndex0 = ref(0);
    const ledgerIndex1 = ref(0);
    const ledgerIndex2 = ref(0);
    return {
      ledgerIndex0,
      ledgerIndex1,
      ledgerIndex2,
      address: computed(() => store.state.addressInfo.address),
      accountNumber: computed(() => store.state.accountInfo.accountNumber),
      balance: computed(() => prettyBalance(store.state.accountInfo.coins)),
      sequence: computed(() => store.state.accountInfo.sequence),
      delegations: computed(() => store.state.accountInfo.delegations.map((delegation) => (
        { ...delegation, balance: `${delegation.balance / 1e9} LIKE` }
      ))),
      updateLedgerPath: () => store.dispatch(UPDATE_LEDGER_PATH, getLedgerPath(ledgerIndex0.value, ledgerIndex1.value, ledgerIndex2.value)),
    };
  },
};

</script>

<style scoped>
  .path-container input {
    width: 30px;
  }
</style>
