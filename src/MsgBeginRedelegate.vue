<template>
  <div>
    <h3>Redelegate</h3>
    <div>
      From validator address: <input v-model.trim="fromValidator">
    </div>
    <div>
      To validator address: <input v-model.trim="toValidator">
    </div>
    <div>
      Amount: <input v-model.trim.number="amount"> LIKE
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { COMMIT_ADD_MSG  } from './store.js';
import { createMsgBeginRedelegate } from './cosmos.js';

export default {
  setup() {
    const store = useStore();
    const fromValidator = ref('');
    const toValidator = ref('');
    const amount = ref(0);
    const addMsg = () => {
      const delegator = store.state.addressInfo.address;
      const amountInNanolike = amount.value * 1e9;
      const msg = createMsgBeginRedelegate({
        delegator,
        fromValidator: fromValidator.value,
        toValidator: toValidator.value,
        amount: amountInNanolike,
      });
      store.commit(COMMIT_ADD_MSG, msg)
    };
    return {
      fromValidator,
      toValidator,
      amount,
      addMsg,
    };
  }
}
</script>
