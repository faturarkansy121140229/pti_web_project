import React, { useEffect, useState } from 'react';
import { Space, Tag, Table, Button, Modal, Breadcrumb, Form, Input, Select, DatePicker } from 'antd';
import { database, ref, set, push, onValue, child, update, remove, auth, createUserWithEmailAndPassword } from '../../config/firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusCircle, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import Datatable from "../../components/Datatablestatus/Datatable";
import NavBar from "../../components/content/Navbar"; // Import NavBar

const { Option } = Select;
const layout = null;
const tailLayout = {
  wrapperCol: { span: 24 },
};

const Statussupir = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const userId = window.localStorage.getItem('userId');
  const email = window.localStorage.getItem('email');
  const isLogin = window.localStorage.getItem('isLogin');
  const [form] = Form.useForm();

  const onSupirChange = (value) => {};

  const onJenisAngkutanChange = (value) => {};

  const onFinish = (values) => {
    const { username, password } = values;
    createUserWithEmailAndPassword(auth, username + '@gmail.com', password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User Successful Added!");
      })
      .catch((error) => {
        alert("Oppps...User Failed Added!");
      });
    onReset();
  };

  const onReset = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (userId && email && isLogin) {}
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button style={{ backgroundColor: 'blue', borderColor: 'blue', color: 'white' }} onClick={showModal}><FontAwesomeIcon icon={faUserEdit} /></Button>
          <Button style={{ backgroundColor: 'red', borderColor: 'red', color: 'white' }} onClick={showModal}><FontAwesomeIcon icon={faTrash} /></Button>
        </Space>
      ),
    },
  ];
  const data = [
    {
      key: '1',
      username: 'John Brown',
    },
    {
      key: '2',
      username: 'Jim Green',
    },
    {
      key: '3',
      username: 'Joe Black',
    }
  ];

  return (
    <>
      <NavBar title="Status Supir" />
      <Datatable />
      <Modal title="Surat Jalan" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null} width={600}>
        <Form
          {...layout}
          layout={'vertical'}
          form={form}
          initialValues={{ layout: 'vertical' }}
          name="control-hooks"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <p><span style={{ color: 'red' }}>*</span> Wajib diisi</p>
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user.uid} - {user.email}</li>
            ))}
          </ul>
          <Form.Item name="username" label="Nama Supir" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="platkendaraan" label="Plat Kendaraan" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="haritanggal" label="Hari,Tanggal" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nomorsuratjalan" label="Nomor Surat Jalan" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nomorpo" label="Nomor PO" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lokasi" label="Lokasi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="volume" label="Volume (liter)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nomorsegel" label="Nomor" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit">
                Buat
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Statussupir;
