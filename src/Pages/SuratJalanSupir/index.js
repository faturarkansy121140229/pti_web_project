import React, { useEffect, useState } from 'react';
import { Space, Table, Tag, Button, Modal, Breadcrumb, Form, Input, Select, DatePicker } from 'antd';
import { database, ref, set, push, onValue, child, update, remove } from '../../config/firebase';
import DatatableSJ from "../../components/DatatableSuratjalan/DatatableSJ"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlusCircle,
  faUserEdit,
  faList
} from "@fortawesome/free-solid-svg-icons";
import NavBar from "../../components/content/Navbar"; // Import NavBar

const { Option } = Select;
const layout = null;
const tailLayout = {
  wrapperCol: {span: 24 },
};

const SuratJalanSupir = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = window.localStorage.getItem('userId');
    const email = window.localStorage.getItem('email');
    const isLogin = window.localStorage.getItem('isLogin');

    const [form] = Form.useForm();

  const onSupirChange = (value) => {
  };

  const onJenisAngkutanChange = (value) => {
  };

  const onFinish = (values) => {
    console.log('formData',values);
  };

  const onReset = () => {
    form.resetFields();
  };

    function writeUserData(userId, isLogin, email) {
      push(ref(database, 'users/' + userId), {
        isLogin,
        email
      });
    }

    function readUserData(userId) {
      const starCountRef = ref(database, 'users/' + userId);
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();

        const formData = [];
        Object.keys(data).map((val, key) => {
          formData.push({
            key: val,
            data : data[val]
          })
        });
        console.log('formData',formData);
      });
    }

    function writeNewUser(userId, email) {
      // A post entry.
      const postData = {
        email : 'wahyunew@gmail.com'
      };
    
      // Get a key for a new Post.
      const newPostKey = push(child(ref(database), 'users')).key;
    
      // Write the new post's data simultaneously in the posts list and the user's post list.
      const updates = {};
      updates['/users/' + userId + '/' + newPostKey] = postData;
    
      return update(ref(database), updates);
    }

    useEffect(() => {
      if (userId && email && isLogin) {
        // writeUserData(userId, isLogin, email);
        // readUserData(userId);
        // writeNewUser(userId, email);
      }
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
        title: 'Nama Supir',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a>{text}</a>,
      },
      {
        title: 'Tanggal Proses',
        dataIndex: 'plat',
        key: 'plat',
      },
      {
        title: 'Ukuran',
        key: 'status',
        dataIndex: 'status',
        render: (_, { tags }) => (
          <>
            {tags.map((tag) => {
              let color = tag.length > 5 ? 'green' : 'green';
              if (tag === 'Tidak Tersedia') {
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              );
            })}
          </>
        ),
      },
      {
        title: 'Surat Jalan',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
          <Button style={{ backgroundColor: '#1DB9AF', borderColor: '#1DB9AF', color: 'white' }} onClick={showModal}>Lihat</Button>
          <Button style={{ backgroundColor: '#3AADC6', borderColor: '#3AADC6', color: 'white' }} onClick={showModal}>Unduh</Button>
          </Space>
          
        ),
      },
    ];
    const data = [
      {
        key: '1',
        name: 'Tony Stark',
        plat: 'BG 2024 BRR',
        tags: ['Tersedia'],
      },

      
    ];

    return (
      <>
      <NavBar title="Surat Jalan dan BAST" />
        <div style={{ display:'flex',justifyContent:'space-between', marginLeft: '20px' }}>
          <Breadcrumb
            separator=">"
            items={[
              {
                title: 'Home',
              },
              {
                title: 'Surat Jalan dan BAST',
                href: 'javascript:void(0)'
              }
            ]}
          />
          
        </div>
        <DatatableSJ/>
      </>
    );
};
export default SuratJalanSupir;