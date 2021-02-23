<template>
  <div>
    <div>
      Send to address: <input v-model.trim="to">
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
import { createMsgSend } from './cosmos.js';

export default {
  setup() {
    const store = useStore();
    const to = ref('');
    const amount = ref(0);
    const addMsg = () => {
      const from = store.state.addressInfo.address;
      const amountInNanolike = amount.value * 1e9;
      const msg = createMsgSend({
        from,
        to: to.value,
        amount: amountInNanolike,
      });
      store.commit(COMMIT_ADD_MSG, msg)
    };
    return {
      to,
      amount,
      addMsg,
    };
  }
}
</script>
