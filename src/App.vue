<template>
  <div>
    <AccountInfo />
  </div>
  <div>
    Select function: 
    <button @click="select('MsgSend')">Send LIKE</button>
    <button @click="select('MsgDelegate')">Delegate to validator</button>
    <button @click="select('MsgBeginRedelegate')">Redelegate between validators</button>
    <button @click="select('MsgUndelegate')">Undelegate from validator</button>
    <button @click="select('MsgWithdrawDelegationReward')">Withdraw delegation reward</button>
  </div>
  <div>
    <MsgSend v-if="selected === 'MsgSend'" />
    <MsgDelegate v-if="selected === 'MsgDelegate'" />
    <MsgBeginRedelegate v-if="selected === 'MsgBeginRedelegate'" />
    <MsgUndelegate v-if="selected === 'MsgUndelegate'" />
    <MsgWithdrawDelegationReward v-if="selected === 'MsgWithdrawDelegationReward'" />
  </div>
  <div>
    <Msgs />
  </div>
  <div>
    <Tx />
  </div>
</template>

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
