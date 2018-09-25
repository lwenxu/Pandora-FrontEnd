import {query as queryUsers, queryCurrent, changeStatus} from '@/services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    * fetch({payload}, {call, put}) {
      const response = yield call(queryUsers, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
    },
    * status({payload}, {call, put}) {
      const response = yield call(changeStatus, payload);
      yield put({
        'type': 'updateStatus',
        payload: response,
        params: payload
      })
    },
    * refresh({payload}, {call, put}) {
      yield put({
        type: 'save',
      });
    },
    * fetchCurrent(_, {call, put}) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    * fetchCurrent1(_, {call, put}) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },

  },

  reducers: {
    save(state, action) {
      let dataMap = [];
      action.payload.map(x => {
        x.key = x.id;
        dataMap.push(x);
      });
      return {
        ...state,
        list: dataMap,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    updateStatus(state, action) {
      if (action.payload.code === 201) {
        const {list} = state;
        const {params: params} = action;
        const id = params.id, status = params.status;
        for (let key in list) {
          if (id.indexOf(list[key].id) !== -1) {
            list[key].status = status;
            if (params.type === 'delete') {
              list.splice(key, 1);
            }
          }
        }
        state.list = list;
      }
      return {
        ...state,
        currentUser: action.payload || {},
      };
    }
  },
};
