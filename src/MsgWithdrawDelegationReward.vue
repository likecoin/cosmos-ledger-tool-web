<template>
  <div>
    <h3>Withdraw Rewards</h3>
    <div>
      Validator address: <input v-model.trim="validator">
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { COMMIT_ADD_MSG  } from './store.js';
import { createMsgWithdrawDelegationReward } from './cosmos.js';

export default {
  setup() {
    const store = useStore();
    const validator = ref('');
    const addMsg = () => {
      const delegator = store.state.addressInfo.address;
      const msg = createMsgWithdrawDelegationReward({
        delegator,
        validator: validator.value,
      });
      store.commit(COMMIT_ADD_MSG, msg)
    };
    return {
      validator,
      addMsg,
    };
  }
}
</script>
