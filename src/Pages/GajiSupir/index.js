import React, { useEffect, useState } from 'react';
import { Space, Table, Tag, Button, Modal, Breadcrumb, Form, Input, Select, DatePicker } from 'antd';
import { database, ref, set, push, onValue, child, update, remove, auth, createUserWithEmailAndPassword } from '../../config/firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlusCircle,
  faUserEdit,
  faList
} from "@fortawesome/free-solid-svg-icons";
import Datatable from "../../components/DatatableGaji/DatatableGaji"
import NavBar from "../../components/content/Navbar"; // Import NavBar


const { getUsersData } = require('../../config/firebase/firebaseadmin');

const { Option } = Select;
const layout = null;
const tailLayout = {
  wrapperCol: {span: 24 },
};

const GajiSupir = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = window.localStorage.getItem('userId');
    const email = window.localStorage.getItem('email');
    const isLogin = window.localStorage.getItem('isLogin');



    useEffect(() => {

      if (userId && email && isLogin) {

      }
    }, []);

    return (
      <>
        <NavBar title="Gaji Supir" />
        <div style={{ display:'flex',justifyContent:'space-between', marginLeft: '20px' }}>
          <Breadcrumb
            separator=">"
            items={[
              {
                title: 'Home',
              },
              {
                title: 'Gaji Supir',
                href: 'javascript:void(0)'
              }
            ]}
          />
          
        </div>
        <Datatable/>
   
      </>
    );
};
export default GajiSupir;