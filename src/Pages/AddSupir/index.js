import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'antd';
import { Link } from "react-router-dom";
import "./index.css";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { doc, serverTimestamp, setDoc} from "firebase/firestore"; 
import { auth, db, storage} from "../../config/firebase/index";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const AddSupir = ({inputs}) => {
    const [file, setFile] = useState("");
    const [data, setData] = useState({});
    const [per, setPerc] = useState(null);
    const [isInputsFilled, setIsInputsFilled] = useState(false);
    const [isReadyToSend, setIsReadyToSend] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    useEffect(() => {
      const filledInputs = Object.values(data).filter(value => value !== "").length;
      setIsInputsFilled(filledInputs === inputs.length);
    }, [data, inputs]);

    useEffect(() => {
      setIsReadyToSend(isInputsFilled && per !== null && per === 100);
    }, [isInputsFilled, per]);

    const handleInput = (e) => {
      const id = e.target.id;
      const value = e.target.value;
      setData((prevData) => {
        const newData = { ...prevData, [id]: value };
        
        // Check if all required inputs are filled
        const filledInputs = Object.values(newData).filter((value) => value !== "").length;
        setIsInputsFilled(filledInputs === inputs.length);
        
        // Validate password if necessary
        if (id === "password" || id === "validasi_password") {
          const password = id === "password" ? value : newData.password;
          const validasiPassword = id === "validasi_password" ? value : newData.validasi_password;
          setIsPasswordValid(password === validasiPassword);
        }
        
        return newData;
      });
    };

    const handleAdd = async (e) => {
      e.preventDefault();
      try {
        if (!isInputsFilled) {
          console.log("Mohon lengkapi semua inputan sebelum mengirimkan data.");
          alert("Mohon lengkapi semua inputan sebelum mengirimkan data.");
          return;
        }

        if (!isPasswordValid) {
          alert("Password dan Validasi Password tidak sama.");
          return;
        }
    
        if (file !== "") {
          const name = new Date().getTime() + file.name;
    
          const storageRef = ref(storage, name);
          const uploadTask = uploadBytesResumable(storageRef, file);
    
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
              setPerc(progress);
            }, 
            (error) => {
              console.log(error)
            }, 
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
                // Menambahkan URL gambar ke dalam objek data
                setData(prevData => ({
                  ...prevData,
                  status: false,
                  img: downloadURL,
                }));
    
                // Setelah mendapatkan URL gambar, tambahkan data ke Firestore
                const res = await createUserWithEmailAndPassword(
                  auth, 
                  data.email, 
                  data.password
                );
    
                // Gunakan `setDoc` untuk menambahkan dokumen baru ke Firestore
                await setDoc(doc(db, "mastersupir", res.user.uid), {
                  ...data,
                  status: false,
                  img: downloadURL,
                  timeStamp: serverTimestamp()
                });
    
                // Reset form setelah data terkirim
                setData({});
                setFile("");
                setPerc(null);
                setIsInputsFilled(false);
                setIsReadyToSend(false);
                alert("Data berhasil diinputkan");
                window.location.href = "/user-manajemen";
                window.location.reload(); 
              } catch(err) {
                console.log(err);
              }
            }
          );
        } else {
          // Jika tidak ada file yang diunggah, tambahkan data ke Firestore tanpa gambar
          const res = await createUserWithEmailAndPassword(
            auth, 
            data.email, 
            data.password
          );
    
          // Gunakan `setDoc` untuk menambahkan dokumen baru ke Firestore
          await setDoc(doc(db, "mastersupir", res.user.uid), {
            ...data,
            status: false,
            timeStamp: serverTimestamp()
          });
    
          // Reset form setelah data terkirim
          setData({});
          setIsInputsFilled(false);
          setIsReadyToSend(false);
          alert("Data berhasil diinputkan");
          window.location.href = "/user-manajemen";
          window.location.reload(); 
        }
      } catch(err) {
        console.log(err);
      }
    };
    
    return (
      <>
        
        <div style={{ display:'flex',justifyContent:'space-between', marginLeft: '20px' }}>
          <Breadcrumb
            separator=">"
            items={[
              {
                title: 'Home',
              },
              {
                title: 'User Managemen',
                href: 'javascript:void(0)'
              },
              {
                title: 'Buat Akun Supir',
                href: 'javascript:void(0)'
              }
            ]}
          />
          
        </div>
        <div className='top'>
          <h2>Buat Akun Supir</h2>
        </div>
        <div className='bottom'>
          <div className='left'>
            <p>Foto Supir</p>
            <img 
            src={
              file
                ? URL.createObjectURL(file)
                : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
            } 
            alt=''/>
            <label htmlFor='file'>
              UPLOAD IMAGE : <DriveFolderUploadOutlinedIcon className='icon'/>
            </label>
          </div>
          <div className='right'>
            <form onSubmit={handleAdd}>
              <div className='formInput'>

                <input 
                  type='file' 
                  id='file' 
                  onChange={(e) => setFile(e.target.files[0])} 
                  style={{display:"none"}}
                />
              </div>
              {inputs.map((input) => (
                <div className="formInput" key={input.id} style={{ gridColumn: 'auto' }}>
                  <label>{input.label}</label>
                  <input 
                    id={input.id}
                    type={input.type} 
                    placeholder={input.placeholder} 
                    onChange={handleInput}
                  />
                </div>
              ))}
                <button disabled={isReadyToSend} type="submit">Kirim</button>
              
            </form>
          </div>
        </div>
      </>
    );
};
export default AddSupir;