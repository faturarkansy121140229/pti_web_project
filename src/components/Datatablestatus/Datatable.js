import "./Datatable.css";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../datatablesourcestatus";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Space, Tag, Table, Button, Modal, Breadcrumb, Form, Input, Select, DatePicker } from 'antd';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db, storage } from "../../config/firebase/index";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateBAST } from '../Generate BAST/Generatebast';
import { generateSJ } from '../Generate SJ/Generatesj';
import { format, toZonedTime } from 'date-fns-tz';
import noImageIcon from '../../components/assets/noimage.png'; 

const layout = null;
const tailLayout = {
  wrapperCol: {span: 24 },
};

const Datatable = () => {
  const [isModalOpenbast, setIsModalOpenbast] = useState(false);
  const [isModalOpensj, setIsModalOpensj] = useState(false);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
     const fetchData = async () => {
       let list = [];
       try {
         const querySnapshot = await getDocs(collection(db, "mastersupir"));
         querySnapshot.forEach((doc) => {
           list.push({id : doc.id, ...doc.data()});
         });
         setData(list);
         console.log(list);
       } catch (err) {
         console.log(err);
       }
     };
     fetchData();
  }, []);

  const getUserById = async (userId) => {
    try {
      const userDoc = await doc(db, 'mastersupir', userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        return { id: userSnapshot.id, ...userSnapshot.data() };
      } else {
        console.log('No such user document!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
      return null;
    }
  };
  const getCurrentTimestampInWIB = () => {
    const date = new Date();
    const timeZone = 'Asia/Jakarta'; // Timezone for WIB
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'yyyyMMddHHmmss', { timeZone });
  };

  const navigate = useNavigate();
  const checkAndProceedWithGeneration = async () => {
    if (selectedUserData && (selectedUserData.suratjalan || selectedUserData.beritaacara)) {
      const confirmed = window.confirm('Tindakan ini akan mengganti data yang ada. Apakah Anda yakin ingin melanjutkan?');
      if (!confirmed) {
        return;
      }
    }
  };

  const onFinishbast = async (values) => {
    try {
      setIsLoading(true);
      await checkAndProceedWithGeneration();
      // Menyimpan data ke Firestore
      const timestamp = getCurrentTimestampInWIB();
      const dataWithTimestamp = { 
        ...values,
        no_po: values.no_po || "", // Pastikan nilai Nomor PO adalah string kosong jika tidak diisi
        npwp: values.npwp || "",  
        timestamp: serverTimestamp() 
      };
        const docRef = await addDoc(collection(db, 'bast'), dataWithTimestamp);
        console.log("Document written with ID: ", docRef.id);
        const pdfBlob = await generateBAST(values);
        const pdfURL = await uploadPDFToFirestorebast(pdfBlob, values.username, timestamp);
        await updateDoc(doc(db, 'mastersupir', selectedUserData.id), {
          beritaacara: pdfURL
        })
        await updateDoc(doc(db, 'bast', docRef.id), {
          beritaacara: pdfURL
        });
      alert("Data Berhasil Disimpan!");
      setIsLoading(false);
      setIsModalOpenbast(false); 
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding document or uploading PDF:", error);
      alert("Data berhasil disimpan!");
      setIsModalOpenbast(false); 
      window.location.reload(); 
    }
    form.resetFields();;
  };

  const onFinishsj = async (values) => {
    try {
      setIsLoading(true);
      await checkAndProceedWithGeneration();
      // Menyimpan data ke Firestore
      const timestamp = getCurrentTimestampInWIB();
      const dataWithTimestamp = { 
        ...values,
        no_po: values.no_po || "", // Pastikan nilai Nomor PO adalah string kosong jika tidak diisi
        npwp: values.npwp || "",  
        timestamp: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'suratjalan'), dataWithTimestamp);
        console.log("Document written with ID: ", docRef.id);
        const pdfBlob = await generateSJ(values);
        const pdfURL = await uploadPDFToFirestoresj(pdfBlob, values.username, timestamp);
        await updateDoc(doc(db, 'mastersupir', selectedUserData.id), {
          suratjalan: pdfURL
        })
        await updateDoc(doc(db, 'bast', docRef.id), {
          beritaacara: pdfURL
        });
      alert("Data Berhasil Disimpan!");
      setIsLoading(false);
      setIsModalOpensj(false); 
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding document or uploading PDF:", error);
      alert("Data Berhasil Disimpan!");
      setIsModalOpensj(false); 
      window.location.reload(); 
    }
    form.resetFields();;
  };

  const showModalbast = async (params) => {
    if (params && params.row && params.row.id) {
      const userData = await getUserById(params.row.id);
      if (userData) {
        setSelectedUserData(userData); // Mengatur data pengguna yang dipilih
        setIsModalOpenbast(true); // Membuka modal
      } else {
        console.log('Error fetching user data.');
      }
    } else {
      console.log('Invalid params or row data.');
    }
  };

    const showModalsj = async (params) => {
    if (params && params.row && params.row.id) {
      const userData = await getUserById(params.row.id);
      if (userData) {
        setSelectedUserData(userData); // Mengatur data pengguna yang dipilih
        setIsModalOpensj(true); // Membuka modal
      } else {
        console.log('Error fetching user data.');
      }
    } else {
      console.log('Invalid params or row data.');
    }
  };
  
  const handleOk = () => {
    setIsModalOpensj(false);
    setIsModalOpenbast(false);
  };
  const handleCancel = () => {
    setIsModalOpensj(false);
    setIsModalOpenbast(false);
    alert("Input data dibatalkan");
    window.location.reload(); 
  };

  console.log(data);


  const uploadPDFToFirestorebast = async (blob, username, timestamp) => {
    const formattedDate = timestamp.substring(0, 8); // YYYYMMDD
    const formattedTime = timestamp.substring(8); // HHmmss
    const storageRef = ref(storage, `bast/BAST-${username}-${formattedDate}${formattedTime}.pdf`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const uploadPDFToFirestoresj = async (blob, username, timestamp) => {
    const formattedDate = timestamp.substring(0, 8); // YYYYMMDD
    const formattedTime = timestamp.substring(8); // HHmmss
    const storageRef = ref(storage, `suratjalan/SuratJalan-${username}-${formattedDate}${formattedTime}.pdf`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };


  const actionColumn = [
    {
      field: "action1",
      headerName: "Surat Jalan",
      headerAlign: 'center',
      width: 290,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div
              className={`viewButton ${!params.row.status ? 'disabledButton' : ''}`}
              onClick={() => params.row.status && showModalsj(params)}
            >
              Buat Surat Jalan
            </div>
          </div>
        );
      },
    },
    {
      field: "action2",
      headerName: "Berita Acara Serah Terima",
      headerAlign: 'center',
      width: 290,
      renderCell: (params) => {
        return (
          <div className="cellAction">
          <div
            className={`viewButton ${!params.row.status ? 'disabledButton' : ''}`}
            onClick={() => params.row.status && showModalbast(params)}
          >
              Buat BAST
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
        Status Supir
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        rowHeight={50}
        columns={[
        ...userColumns,
          {
            field: "status",
            headerName: "Status",
            headerAlign: 'center',
            width: 300,
            renderCell: (params) => {
              return (
                <div className="statusContainer">
                  <div className={`cellWithStatus ${params.row.status ? 'available' : 'unavailable'}`}>
                    {params.row.status ? "Tersedia" : "Tidak Tersedia"}
                   </div>
                </div>
              );
            },
            
          },
          ...actionColumn,
        ]}
        pageSize={9}
        rowsPerPageOptions={[9]}
        style={{ height: 650, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      />
      <Modal title="Berita Acara dan Serah Terima" open={isModalOpenbast} onOk={handleOk} onCancel={handleCancel} footer={null} width={600}>
          <Form
              {...layout}
              layout={'vertical'}
              form={form}
              initialValues={{ layout: 'vertical' }}
              name="control-hooks"
              onFinish={onFinishbast}
              style={{ maxWidth: 600 }}
            >
              <p><span style={{ color:'red' }}>*</span> Wajib diisi</p>
              <ul>
                {users.map((user, index) => (
                  <li key={index}>{user.uid} - {user.email}</li>
                ))}
              </ul>
              <Form.Item name="username" label="Nama Supir" rules={[{ required: true }]} initialValue={selectedUserData ? selectedUserData.username : ''}>
                <Input/>
              </Form.Item>
              <Form.Item name="no_platkendaraan" label="Nomor Plat Kendaraan" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="kendaraan" label="Kendaraan" rules={[{ required: true }]}>
                <Input placeholder="liter"/>
              </Form.Item>
              <Form.Item name="no_bast" label="Nomor BAST" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="tanggal_sj" label="Tanggal Surat Jalan" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="ship_to" label="Ship to" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="alamat" label="Alamat" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="no_po" label="Nomor PO">
                <Input/>
              </Form.Item>
              <Form.Item name="alamatkirim" label="Alamat Kirim" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="npwp" label="NPWP">
                <Input/>
              </Form.Item>
              <Form.Item name="nama_produk" label="Nama Produk" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="volume" label="Volume" rules={[{ required: true }]}>
                <Input placeholder="liter"/>
              </Form.Item>
              <Form.Item name="terbilang" label="Terbilang" rules={[{ required: true }]}>
                <Input placeholder="liter"/>
              </Form.Item>
              <Form.Item name="segel_atas" label="Segel Atas" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="segel_bawah" label="Segel Bawah" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Buat dan Kirim
                  </Button>
                </Space>
              </Form.Item>
          </Form>        
        </Modal>

        <Modal title="Surat Jalan" open={isModalOpensj} onOk={handleOk} onCancel={handleCancel} footer={null} width={600}>
          <Form
              {...layout}
              layout={'vertical'}
              form={form}
              initialValues={{ layout: 'vertical' }}
              name="control-hooks"
              onFinish={onFinishsj}
              style={{ maxWidth: 600 }}
            >
              <p><span style={{ color:'red' }}>*</span> Wajib diisi</p>
              <ul>
                {users.map((user, index) => (
                  <li key={index}>{user.uid} - {user.email}</li>
                ))}
              </ul>
              <Form.Item name="username" label="Nama Supir" rules={[{ required: true }]} initialValue={selectedUserData ? selectedUserData.username : ''}>
                <Input/>
              </Form.Item>
              <Form.Item name="no_platkendaraan" label="Nomor Plat Kendaraan" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="no_sj" label="Nomor Surat Jalan" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="haritanggal" label="Hari Tanggal" rules={[{ required: true }]}>
                <Input placeholder="Hari, tanggal-bulan-tahun"/>
              </Form.Item>
              <Form.Item name="lokasi" label="Lokasi" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="nama_transportir" label="Nama Transportir" rules={[{ required: true }]}>
                <Input placeholder="PT.SEJAHTERA PERKASA ENERGI"/>
              </Form.Item>
              <Form.Item name="nama_barang" label="Nama Barang" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="volume" label="Volume" rules={[{ required: true }]}>
                <Input placeholder="liter"/>
              </Form.Item>
              <Form.Item name="segel" label="Segel" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="tujuan" label="Tujuan" rules={[{ required: true }]}>
                <Input/>
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Buat dan Kirim
                  </Button>
                </Space>
              </Form.Item>
          </Form>        
        </Modal>
    </div>
  );
};

export default Datatable;