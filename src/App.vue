<template>
  <div class="account-info">
    <AccountInfo />
  </div>
  <div class="select-function">
    Select function: 
    <button @click="select('MsgSend')">Send LIKE</button>
    <button @click="select('MsgDelegate')">Delegate</button>
    <button @click="select('MsgBeginRedelegate')">Redelegate</button>
    <button @click="select('MsgUndelegate')">Undelegate</button>
    <button @click="select('MsgWithdrawDelegationReward')">Withdraw</button>
  </div>
  <div class="msg-input">
    <MsgSend v-if="selected === 'MsgSend'" />
    <MsgDelegate v-if="selected === 'MsgDelegate'" />
    <MsgBeginRedelegate v-if="selected === 'MsgBeginRedelegate'" />
    <MsgUndelegate v-if="selected === 'MsgUndelegate'" />
    <MsgWithdrawDelegationReward v-if="selected === 'MsgWithdrawDelegationReward'" />
  </div>
  <div class="msg-list">
    <Msgs />
  </div>
  <div class="tx-info">
    <Tx />
  </div>
</template>

<style scoped>
.account-info {
  margin: 5px 0 5px 0;
  border-style: solid;
  border-width: 1px;
}

.select-function {
  margin: 5px 0 5px 0;
  border-style: solid;
  border-width: 1px;
}

.msg-input {
  margin: 5px 0 5px 0;
  border-style: solid;
  border-width: 1px;
  height: 10rem;
}

.msg-list {
  margin: 5px 0 5px 0;
  border-style: solid;
  border-width: 1px;
}

.tx-info {
  margin: 5px 0 5px 0;
  border-style: solid;
  border-width: 1px;
}
</style>

<script>
import AccountInfo from './AccountInfo.vue';
import MsgSend from './MsgSend.vue';
import MsgDelegate from './MsgDelegate.vue';
import MsgBeginRedelegate from './MsgBeginRedelegate.vue';
import MsgUndelegate from './MsgUndelegate.vue';
import MsgWithdrawDelegationReward from './MsgWithdrawDelegationReward.vue';
import Msgs from './Msgs.vue';
import Tx from './Tx.vue';
import { ref } from 'vue';

export default {
  components: {
    AccountInfo,
    MsgSend,
    MsgDelegate,
    MsgBeginRedelegate,
    MsgUndelegate,
    MsgWithdrawDelegationReward,
    Msgs,
    Tx,
  },
  setup() {
    const selected = ref('MsgSend');
    const select = (s) => { selected.value = s };
    return {
      selected,
      select,
    };
  },
};
</script>
