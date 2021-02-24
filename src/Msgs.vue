<template>
  <div>
    <ul>
      <li v-for="(msg, i) in msgs" v-bind:key="msg">
        <button @click="removeMsg(i)">X</button>
        Msg {{i}}: {{msg}}
      </li>
    </ul>
    <button @click="clearMsgs">Clear all  msgs</button>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { COMMIT_REMOVE_MSG, COMMIT_CLEAR_MSGS } from './store.js';

export default {
  setup() {
    const store = useStore();
    const msgs = computed(() => store.state.msgs);
    const removeMsg = (i) => store.commit(COMMIT_REMOVE_MSG, i);
    const clearMsgs = () => store.commit(COMMIT_CLEAR_MSGS);
    return {
      msgs,
      removeMsg,
      clearMsgs,
    };
  }
}
</script>
