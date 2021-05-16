import { createStore } from 'vuex'
import { LCD_ENDPOINT } from './config.js';
import * as Cosmos from './cosmos.js';

export const INIT_COSMOS_LEDGER_APP = 'INIT_COSMOS_LEDGER_APP';
export const COMMIT_ADDRESS_INFO = 'COMMIT_ADDRESS_INFO';
export const UPDATE_LEDGER_PATH = 'UPDATE_LEDGER_PATH';
export const FETCH_COSMOS_INFO =  'FETCH_COSMOS_INFO';
export const COMMIT_ACCOUNT_INFO = 'COMMIT_ACCOUNT_INFO';
export const COMMIT_ADD_MSG = 'COMMIT_ADD_MSG';
export const COMMIT_REMOVE_MSG = 'COMMIT_REMOVE_MSG';
export const COMMIT_CLEAR_MSGS = 'COMMIT_CLEAR_MSGS';

export const store = createStore({
  state() {
    return {
      cosmosLedgerApp: null,
      addressInfo: {
        ledgerPath: Cosmos.DEFAULT_PATH,
        address: '',
        pubKey: {},
      },
      accountInfo: {
        accountNumber: '0',
        sequence: '0',
        coins: [],
        delegations: [],
      },
      msgs: [],
    };
  },
  mutations: {
    [INIT_COSMOS_LEDGER_APP](state, app) {
      state.cosmosLedgerApp = app;
    },
    [COMMIT_ADDRESS_INFO](state, addressInfo) {
      state.addressInfo = addressInfo;
    },
    [COMMIT_ACCOUNT_INFO](state, accountInfo) {
      state.accountInfo = accountInfo;
    },
    [COMMIT_ADD_MSG](state, msg) {
      state.msgs.push(msg);
    },
    [COMMIT_REMOVE_MSG](state, index) {
      state.msgs.splice(index, 1);
    },
    [COMMIT_CLEAR_MSGS](state) {
      state.msgs = [];
    },
  },
  actions: {
    async [INIT_COSMOS_LEDGER_APP]({ commit }) {
      const app = await Cosmos.initCosmosLedgerApp();
      commit(INIT_COSMOS_LEDGER_APP, app);
    },
    async [UPDATE_LEDGER_PATH]({ state, commit, dispatch }, ledgerPath) {
      commit(COMMIT_CLEAR_MSGS);
      if (!state.cosmosLedgerApp) {
        await dispatch(INIT_COSMOS_LEDGER_APP);
      }
      const addressInfo = await Cosmos.readAddressInfo(state.cosmosLedgerApp, { path: ledgerPath });
      commit(COMMIT_ADDRESS_INFO, { ...addressInfo, ledgerPath });
      await dispatch(FETCH_COSMOS_INFO);
    },
    async [FETCH_COSMOS_INFO]({ state, commit }) {
      const [basicAccountInfo, delegations] = await Promise.all([
        Cosmos.fetchBasicAccountInfo(LCD_ENDPOINT, state.addressInfo.address),
        Cosmos.fetchDelegationInfo(LCD_ENDPOINT, state.addressInfo.address),
      ]);
      commit(COMMIT_ACCOUNT_INFO, { ...basicAccountInfo, delegations });
    },
  },
});
