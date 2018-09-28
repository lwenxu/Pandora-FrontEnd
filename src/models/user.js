import {changeStatus, query as queryUsers, queryCurrent} from '@/services/user';
import {addUser, queryAllGroups, updateUser} from '../services/user';

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
    * groups({payload}, {call, put}) {
      const response = yield call(queryAllGroups);
      yield put({
        'type': 'queryGroups',
        payload: response
      })
    },
    * update({payload}, {call, put}) {
      let formVal = {...payload.formValues};
      let {group} = formVal;
      formVal.group = group[group.length - 1] || null;
      payload.formValues.nickName = payload.formValues.nickname;
      const response = yield call(updateUser, formVal);
      if (parseInt(response.code) !== 201) {
        payload.notify('error', '更新用户失败！');
      } else {
        payload.notify('success', '更新用户成功！');
        yield put({
          type: 'updateUser',
          payload: payload,
        });
      }
    },
    * add({payload}, {call, put}) {
      let formVal = {...payload.formValues};
      let {group} = formVal;
      formVal.group = group[group.length - 1] || null;
      payload.formValues.nickName = payload.formValues.nickname;
      const response = yield call(addUser, formVal);
      if (parseInt(response.code) !== 201) {
        payload.notify('error', '添加用户失败！');
      } else {
        payload.notify('success', '添加用户成功！');
        payload.formValues.id = response.data;
        yield put({
          type: 'addUser',
          payload: payload
        })
      }

    },
    * updateModel({payload}, {call, put}) {
      yield put({
        type: 'updateModelReducer',
        payload: payload
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
    updateUser(state, action) {
      let updateVal = action.payload.formValues;
      for (let i = 0; i < state.list.length; i++) {
        if (state.list[i].id === updateVal.id) {
          state.list[i] = updateVal;
          break;
        }
      }
      console.log(state);
      return {
        ...state
      }

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
    },
    queryGroups(state, action) {
      function buildTree(arr) {
        if (arr.length === 0) {
          return null;
        }
        let ret = [];
        for (let i = 0; i < arr.length; i++) {
          let tree = {};
          tree.value = arr[i].id;
          tree.label = arr[i].name;
          tree.children = buildTree(arr[i].children);
          ret.push(tree);
        }
        return ret;
      }

      if (parseInt(action.payload.code) === 201) {
        const {data} = action.payload;
        state.groups = buildTree(data);
        // console.log("kk",state);
      }
      return {
        ...state,
      }
    },
    addUser(state, action) {
      state.list.unshift(action.payload.formValues);
      return {
        ...state
      };
    }
  },
};
