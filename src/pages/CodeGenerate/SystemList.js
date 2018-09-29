import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List,
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
  Popconfirm, Tooltip, Cascader, Checkbox, AutoComplete, Upload
} from 'antd';

import config from '../../services/config'

import Ellipsis from '@/components/Ellipsis';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './SystemList.less';


const FormItem = Form.Item;
const { TextArea } = Input;



class Avatar extends React.Component {
  state = {
    loading: false,
  };


  getBase64=(img, callback)=> {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

   beforeUpload=(file)=> {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
      message.error('You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => this.setState({
        imageUrl,
        loading: false,
      }));
    }
  }

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={`${config.baseUrl}/core/file/uploadAttachment`}
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
      </Upload>
    );
  }
}





@Form.create()
@connect(({state, loading}) => ({state: state, loading: loading}))
class AddForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.formLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 13},
    };
  }

  handleNext = currentStep => {
    const {form, handleUpdate} = this.props;
    const {formVals: oldValue} = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = {...oldValue, ...fieldsValue};
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
    const {currentStep} = this.state;
    this.setState({
      currentStep: currentStep - 1,
    });
  };

  forward = () => {
    const {currentStep} = this.state;
    this.setState({
      currentStep: currentStep + 1,
    });
  };

  renderContent = (currentStep, formVals) => {
    const {form} = this.props;
    if (currentStep === 1) {
      return [
        <FormItem key="target" {...this.formLayout} label="监控对象">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{width: '100%'}}>
              <Option value="0">表一</Option>
              <Option value="1">表二</Option>
            </Select>,
          )}
        </FormItem>,
        <FormItem key="template" {...this.formLayout} label="规则模板">
          {form.getFieldDecorator('template', {
            initialValue: formVals.template,
          })(
            <Select style={{width: '100%'}}>
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
            rules: [{required: true, message: '请选择开始时间！'}],
          })(
            <DatePicker
              style={{width: '100%'}}
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
            <Select style={{width: '100%'}}>
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
          rules: [{required: true, message: '请输入规则名称！'}],
          initialValue: formVals.name,
        })(<Input placeholder="请输入"/>)}
      </FormItem>,
      <FormItem key="desc" {...this.formLayout} label="规则描述">
        {form.getFieldDecorator('desc', {
          rules: [{required: true, message: '请输入至少五个字符的规则描述！', min: 5}],
          initialValue: formVals.desc,
        })(<TextArea rows={4} placeholder="请输入至少五个字符"/>)}
      </FormItem>,
    ];
  };

  renderFooter = currentStep => {
    const {handleUpdateModalVisible} = this.props;
    if (currentStep === 1) {
      return [
        <Button key="back" style={{float: 'left'}} onClick={this.backward}>
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
        <Button key="back" style={{float: 'left'}} onClick={this.backward}>
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
    const { addModelVisible, handleAddModelVisible, isUpdate } = this.props;
    const title = isUpdate ? '更新系统信息' : '创建新系统';
    const {currentStep} = this.state;
    const formVals = this.props.values;
    const {getFieldDecorator} = this.props.form;
    const {autoCompleteResult} = this.state;
    const residences = this.props.groups;
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
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
        bodyStyle={{padding: '32px 40px 48px'}}
        destroyOnClose
        title={title}
        visible={addModelVisible}
        onOk={()=>{}}
        onCancel={()=>handleAddModelVisible(false)}
        centered
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
               项目名&nbsp;
                <Tooltip title="项目的中文名称">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
            )}
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入项目名称，建议为中文',
              }],
            })(
              <Input/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="项目描述"
          >
            {getFieldDecorator('description', {
              rules: [{
                required: true, message: '请输入项目描述!',
              }, {}],
            })(
              <TextArea/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="项目图标"
          >
            {getFieldDecorator('image', {
              rules: [{
                required: false, message: '请上传项目图片！',
              }, {}],
            })(
              <Avatar/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
              代码存放路径&nbsp;
                <Tooltip title="末尾的文件夹名称会被当做项目的根路径">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
            )}
          >
            {getFieldDecorator('path', {
              rules: [{required: true, message: '请输入代码生成路径!', whitespace: true}],
            })(
              <Input/>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={(
              <span>
              包名&nbsp;
                <Tooltip title="项目包名">
                <Icon type="question-circle-o"/>
              </Tooltip>
            </span>
            )}
          >
            {getFieldDecorator('package', {
              rules: [{required: true, message: '请输入项目包名!', whitespace: true}],
            })(
              <Input/>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }

  handleUpdateModal = () => {
    const {notify, dispatch, form, handleUpdateModalVisible} = this.props;
    form.validateFields((err, fieldsValue) => {
        if (err) return;
        const values = {
          ...fieldsValue,
          id: this.props.values.id
        };
        const formVals = this.props.values;
        let type = 'update';
        if (!!formVals && formVals.isAdd) {
          type = 'add';
        }
        dispatch({
          type: `user/${type}`,
          payload: {
            formValues: values,
            notify: notify,
          }
        });
      }
    );

    handleUpdateModalVisible(false);
  };
}



@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
class CardList extends PureComponent {

  state = {
    addModelVisible: false,
    isUpdate: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'list/fetch',
      payload: {
        count: 8,
      },
    });
  }

  handleAddModelVisible = (flag, record) => {
    this.setState({
      addModelVisible: flag,
      record: record || {},
    },()=>console.log(this.state))
  };

  render() {
    const {
      list: { list },
      loading,
    } = this.props;

    const { addModelVisible,isUpdate } = this.state;

    const content = (
      <div className={styles.pageHeaderContent}>
        <p>
          Pandora 平台，用最小的工作量，无缝接入， 提供跨越设计与开发的体验解决方案。
        </p>
        <div className={styles.contentLink}>
          <a>
            <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg" />{' '}
            快速开始
          </a>
          <a>
            <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/NbuDUAuBlIApFuDvWiND.svg" />{' '}
            产品简介
          </a>
          <a>
            <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg" />{' '}
            产品文档
          </a>
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraImg}>
        <img
          alt="这是一个标题"
          src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png"
        />
      </div>
    );

    return (
      <PageHeaderWrapper title="系统列表" content={content} extraContent={extraContent}>
        <AddForm
          addModelVisible={addModelVisible}
          handleAddModelVisible={this.handleAddModelVisible}
          isUpdate={isUpdate}
        />
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={['', ...list]}
            renderItem={item =>
              item ? (
                <List.Item key={item.id}>
                  <Card hoverable className={styles.card} actions={[<a>系统文档</a>, <a>系统首页</a>, <a>修改信息</a>]}>
                    <Card.Meta
                      avatar={<img alt="" className={styles.cardAvatar} src={item.avatar}/>}
                      title={<a>{item.title}</a>}
                      description={
                        <Ellipsis className={styles.item} lines={3}>
                          {item.description}
                        </Ellipsis>
                      }
                    />
                  </Card>
                </List.Item>
              ) : (
                <List.Item>
                  <Button type="dashed" className={styles.newButton} onClick={()=>{this.handleAddModelVisible(true)}}>
                    <Icon type="plus"/> 生成新系统
                  </Button>
                </List.Item>
              )
            }
          />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default CardList;
