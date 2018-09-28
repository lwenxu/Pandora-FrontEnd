import { stringify } from 'qs';
import request from '@/utils/request';
import conf from './config'
import {objToFormData} from "../utils/utils";

export async function query(params) {
    return request(`${conf.baseUrl}/admin/user/list?${stringify(params)}`, {method: 'POST'});
}

export async function updateUser(formVal) {
  return request(`${conf.baseUrl}/admin/user/update`,{method:'POST', body: objToFormData(formVal)});
}

export async function queryCurrent() {
    return request('/api/currentUser');
}

export async function changeStatus(params) {
    const queryStr = 'ids=' + params.id + '&status=' + params.status;
    return request(`${conf.baseUrl}/admin/user/updateStatus?${queryStr}`,{method: 'POST'});
}

export async function queryAllGroups() {
  return request(`${conf.baseUrl}/admin/group/list`, {method: 'GET'});
}

export async function addUser(formVal) {
  return request(`${conf.baseUrl}/admin/user/add`,{method:'POST', body: objToFormData(formVal)});
}
