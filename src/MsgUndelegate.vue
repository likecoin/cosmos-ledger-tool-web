<template>
  <div>
    <h3>Undelegate</h3>
    <div>
      Validator address: <input v-model.trim="validator">
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
import { createMsgUndelegate } from './cosmos.js';

export default {
  setup() {
    const store = useStore();
    const validator = ref('');
    const amount = ref(0);
    const addMsg = () => {
      const delegator = store.state.addressInfo.address;
      const amountInNanolike = amount.value * 1e9;
      const msg = createMsgUndelegate({
        delegator,
        validator: validator.value,
        amount: amountInNanolike,
      });
      store.commit(COMMIT_ADD_MSG, msg)
    };
    return {
      validator,
      amount,
      addMsg,
    };
  }
}
</script>
