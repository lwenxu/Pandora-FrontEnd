import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  notification,
  Popconfirm, Tooltip, Cascader, Checkbox, AutoComplete,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './UserList.less';
import { getGroupNameById } from '../../utils/utils';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error', 'success'];
const status = {
  disable: { label: '禁用', id: 0 },
  enable: { label: '正常', id: 1 },
  delete: { label: '删除', id: 2 },
};
const operationMap = {
  delete: '删除记录',
  add: '添加记录',
  disable: '禁用记录',
  enable: '启用记录',
};
const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      destroyOnClose
      title="新建规则"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: '请输入至少五个字符的规则描述！', min: 5 }],
        })(<Input placeholder="请输入"/>)}
      </FormItem>
    </Modal>
  );
});

@Form.create()
  @connect(({state,loading})=>({state:state, loading: loading}))
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        name: props.values.name,
        desc: props.values.desc,
        key: props.values.key,
        target: '0',
        template: '0',
        type: '1',
        time: '',
        frequency: 'month',
      },
      currentStep: 0,
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  handleNext = currentStep => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      this.setState(
        {
          formVals,
        },
        () => {
          if (currentStep < 2) {
            this.forward();
          } else {
            handleUpdate(formVals);
          }
        },
      );
    });
  };

  backward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep - 1,
    });
  };

  forward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep + 1,
    });
  };

  renderContent = (currentStep, formVals) => {
    const { form } = this.props;
    if (currentStep === 1) {
      return [
        <FormItem key="target" {...this.formLayout} label="监控对象">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">表一</Option>
              <Option value="1">表二</Option>
            </Select>,
          )}
        </FormItem>,
        <FormItem key="template" {...this.formLayout} label="规则模板">
          {form.getFieldDecorator('template', {
            initialValue: formVals.template,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">规则模板一</Option>
              <Option value="1">规则模板二</Option>
            </Select>,
          )}
        </FormItem>,
        <FormItem key="type" {...this.formLayout} label="规则类型">
          {form.getFieldDecorator('type', {
            initialValue: formVals.type,
          })(
            <RadioGroup>
              <Radio value="0">强</Radio>
              <Radio value="1">弱</Radio>
            </RadioGroup>,
          )}
        </FormItem>,
      ];
    }
    if (currentStep === 2) {
      return [
        <FormItem key="time" {...this.formLayout} label="开始时间">
          {form.getFieldDecorator('time', {
            rules: [{ required: true, message: '请选择开始时间！' }],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
            />,
          )}
        </FormItem>,
        <FormItem key="frequency" {...this.formLayout} label="调度周期">
          {form.getFieldDecorator('frequency', {
            initialValue: formVals.frequency,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="month">月</Option>
              <Option value="week">周</Option>
            </Select>,
          )}
        </FormItem>,
      ];
    }
    return [
      <FormItem key="name" {...this.formLayout} label="规则名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入规则名称！' }],
          initialValue: formVals.name,
        })(<Input placeholder="请输入"/>)}
      </FormItem>,
      <FormItem key="desc" {...this.formLayout} label="规则描述">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: '请输入至少五个字符的规则描述！', min: 5 }],
          initialValue: formVals.desc,
        })(<TextArea rows={4} placeholder="请输入至少五个字符"/>)}
      </FormItem>,
    ];
  };

  renderFooter = currentStep => {
    const { handleUpdateModalVisible } = this.props;
    if (currentStep === 1) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
          取消
        </Button>,
        <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
          下一步
        </Button>,
      ];
    }
    if (currentStep === 2) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.handleNext(currentStep)}>
          完成
        </Button>,
      ];
    }
    return [
      <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
        取消
      </Button>,
      <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
        下一步
      </Button>,
    ];
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, title } = this.props;
    // const { groups } = this.props.user;
    // console.log(groups);
    const { currentStep } = this.state;
    const formVals = this.props.values;
    const { getFieldDecorator } = this.props.form;
    const { autoCompleteResult } = this.state;
    const residences = this.props.groups;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={title}
        visible={updateModalVisible}
        onCancel={() => handleUpdateModalVisible()}
        onOk={() => this.handleUpdateModal()}
        centered
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
              用户名&nbsp;
                <Tooltip title="登录采用唯一ID">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
            )}
          >
            {getFieldDecorator('username', {
              rules: [{
                required: true, message: '请输入用户名',
              }],
              initialValue: formVals.username,
            })(
              <Input/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="密码"
          >
            {getFieldDecorator('password', {
              rules: [{
                required: false, message: '请输入密码!',
              }, {}],
            })(
              <Input type="password"/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="确认密码"
          >
            {getFieldDecorator('confirm', {
              rules: [{
                required: false, message: '请重复输入密码!',
              }, {}],
            })(
              <Input type="password" onBlur={this.handleConfirmBlur}/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
              昵称&nbsp;
                <Tooltip title="系统中显示的用户名">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
            )}
          >
            {getFieldDecorator('nickname', {
              rules: [{ required: true, message: '请输入昵称!', whitespace: true }],
              initialValue: formVals.nickName,
            })(
              <Input/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="状态">
            {getFieldDecorator('status',{initialValue:formVals.status === 1 ? '启用' : '禁用'})(
              <Select style={{ width: '100%' }}>
                <Option value="1">启用</Option>
                <Option value="2">禁用</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户组"
          >
            {getFieldDecorator('group', {
              initialValue: formVals.group,
              rules: [{ type: 'array', required: true, message: '请选择用户组!' }],
            })(
              <Cascader options={residences}/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="电话"
          >
            {getFieldDecorator('phone', {
              rules: [{ required: false, message: '请输入电话!' }],
              initialValue: formVals.phone,
            })(
              <Input style={{ width: '100%' }}/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="email"
          >
            {getFieldDecorator('email', {
              rules: [{ required: false, message: '请输入电子邮件!' }],
              initialValue: formVals.email,
            })(
              <Input/>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }

  handleUpdateModal = () => {

    const { notify, dispatch, form, handleUpdateModalVisible } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
    });
    let values = form.getFieldsValue(['username', 'nickname', 'password', 'confirm', 'status', 'group', 'phone', 'email']);
    dispatch({
      type: 'user/update',
      payload:{
        formValues: values,
        notify: notify,
      }
    });
    handleUpdateModalVisible(false);
  };
}

/* eslint react/no-multi-comp:0 */
@connect(({ user, loading }) => ({
    user,
    loading: loading.models.user,
  }),
)

@Form.create()
class UserList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };


  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetch',
    });
    dispatch({
      type: 'user/groups',
    });
  }

  handleOperate = (e) => {
    const { dispatch } = this.props;
    const type = e.target.getAttribute('data-operator');
    const ids = [];
    ids.push(parseInt(e.target.id));
    dispatch({
      type: 'user/status',
      payload: {
        status: status[type].id,
        id: ids,
        type,
      },
    });
    this.openNotificationWithIcon('success', `${operationMap[type]}成功 ！`);
  };

  confirmDelete = (id) => {
    const { dispatch } = this.props;
    const type = 'delete';
    const ids = [];
    ids.push(parseInt(id));
    dispatch({
      type: 'user/status',
      payload: {
        status: status[type].id,
        id: ids,
        type,
      },
    });
    this.openNotificationWithIcon('success', `${operationMap[type]}成功 ！`);
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'user/fetch',
      payload: params,
    });
  };


  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'user/fetch',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    switch (e.key) {
      case 'delete':
        dispatch({
          type: 'user/state',
          payload: {
            status: status[e.key].id,
            id: selectedRows.map(row => row.key),
          },
        });
        break;
      case 'disable':
        dispatch({
          type: 'user/status',
          payload: {
            status: status[e.key].id,
            id: selectedRows.map(row => row.key),
          },
        });
        break;
      case 'enable':
        dispatch({
          type: 'user/status',
          payload: {
            status: status[e.key].id,
            id: selectedRows.map(row => row.key),
          },
        });
        break;
      default:
        break;
    }
    this.setState({
      selectedRows: [],
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'user/fetch',
        payload: values,
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/add',
      payload: {
        desc: fields.desc,
      },
    });

    message.success('添加成功');
    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/update',
      payload: {
        name: fields.name,
        desc: fields.desc,
        key: fields.key,
      },
    });

    message.success('配置成功');
    this.handleUpdateModalVisible();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则名称">
              {getFieldDecorator('name')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
                <span className={styles.submitButtons}>
                  <Button type="primary" htmlType="submit">
                查询
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
                  </Button>
                  <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down"/>
                  </a>
                </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则名称">
              {getFieldDecorator('name')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="调用次数">
              {getFieldDecorator('number')(<InputNumber style={{ width: '100%' }}/>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="更新日期">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期"/>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status3')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status4')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up"/>
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  openNotificationWithIcon = (type, msg) => {
    notification[type]({
      message: '操作提示',
      description: msg,
      duration: 3,
    });
  };

  render() {
    const { user, loading } = this.props;
    const { groups } = this.props.user;
    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="delete">批量删除</Menu.Item>
        <Menu.Item key="disable">批量禁用</Menu.Item>
        <Menu.Item key="enable">批量恢复</Menu.Item>
      </Menu>
    );
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '用户名',
        dataIndex: 'username',
      },
      {
        title: '昵称',
        dataIndex: 'nickName',
        // render: val => `${val} 万`,
        // mark to display a total number
        // needTotal: true,
      }
      , {
        title: '群组',
        dataIndex: 'group',
        render: val => {
          if (!val || val.length === 0) {
            return '-';
          } else {
            return getGroupNameById(parseInt(val[val.length - 1]), groups) || '-';
          }
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        filters: [
          {
            text: status.disable.label,
            value: status.disable.id,
          },
          {
            text: status.enable.label,
            value: status.enable.id,
          },
        ],
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]}/>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => {
          let op = null;
          if (parseInt(record.status) === 1) {
            op = <a data-operator="disable" id={record.id} onClick={this.handleOperate}>禁用</a>;
          } else {
            op = <a data-operator="enable" id={record.id} onClick={this.handleOperate}>启用</a>;
          }
          return (
            <Fragment>
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>修改</a>
              <Divider type="vertical"/>
              <Popconfirm title="确定删除？" onConfirm={() => this.confirmDelete(record.id)} okText="是" cancelText="否">
                <a>删除</a>
              </Popconfirm>
              <Divider type="vertical"/>
              {op}
            </Fragment>
          );
        },
      }
      ,
    ];
    return (
      <PageHeaderWrapper title="查询用户">

        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建用户
              </Button>
              {selectedRows.length > 0 && (
                <span>
                      <Button>批量操作</Button>
                      <Dropdown overlay={menu}>
                        <Button>
                      更多操作 <Icon type="down"/>
                        </Button>
                      </Dropdown>
                    </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={user}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible}/>
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
            groups={groups}
            notify={this.openNotificationWithIcon}
            title="修改用户信息"
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default UserList;
