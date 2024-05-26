import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db, storage } from "../../config/firebase/index";
import "./index.css";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";

const EditSupir = ({ selectedDocId }) => {
  const [data, setData] = useState({});
  const [photoURL, setPhotoURL] = useState(""); // Tambahkan state untuk URL foto
  const { id } = useParams();

  useEffect(() => {
    if (id) { // Gunakan id dari useParams di sini
      fetchData(id); // Gunakan id yang diperoleh dari URL
    }
  }, [id]);

  const fetchData = async (docId) => {
    try {
      const docRef = doc(db, "mastersupir", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Data fetched:", data);
        setData(data);

        // Ambil URL foto dari field img jika tersedia
        if (data.img) {
          setPhotoURL(data.img);
        } else {
          // Jika tidak ada foto, gunakan URL foto default
          setPhotoURL("https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg");
        }
      } else {
        console.log("No such document found for ID:", docId);
      }
    } catch (err) {
      console.error("Error fetching document: ", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "mastersupir", id);
      await updateDoc(docRef, { ...data, img: photoURL }); 
      console.log("Document successfully updated!");
      window.alert("Data berhasil di edit");
      window.location.href = "/user-manajemen";
    } catch (err) {
      console.error("Error updating document: ", err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Mendapatkan file yang dipilih oleh pengguna
    if (file) {
      try {
        // Upload foto ke penyimpanan Firebase
        const storageRef = storage.ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        // Dapatkan URL foto yang baru diunggah
        const imageURL = await fileRef.getDownloadURL();
        setPhotoURL(imageURL); // Mengatur URL foto baru ke state
  
        // Perbarui dokumen mastersupir dengan URL foto yang baru
        const docRef = doc(db, "mastersupir", id);
        await updateDoc(docRef, { ...data, img: imageURL });
      } catch (err) {
        console.error("Error uploading file: ", err);
      }
    }
  };

  const handleCancel = () => {
    window.location.href = "/user-manajemen";
  };

  console.log("Rendered with selectedDocId:", selectedDocId);
  console.log("Current data state:", data);

  return (
    <>
      <div className='top'>
        <h2>Edit Akun Supir</h2>
      </div>
      <div className='bottom'>
        <div className='left'>
          <p>Foto Supir</p>
          <img 
            src={photoURL} 
            alt=''
          />
          <label htmlFor='file'>
            UPLOAD IMAGE : <DriveFolderUploadOutlinedIcon className='icon'/>
            <input 
            type="file" 
            id="file" 
            accept="image/*" 
            style={{ display: "none" }} 
            onChange={handleFileChange} 
            />
          </label>
        </div>
        <div className='right'>
        <form onSubmit={handleSubmit}>
            <div className='formInput'>
              <label>Nama Panggilan</label>
              <input 
                type="text" 
                name="username"
                value={data.username || ''} 
                onChange={handleInputChange}
              />
            </div>
            <div className='formInput'>
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                name="namalengkap"
                value={data.namalengkap || ''} 
                onChange={handleInputChange}
              />
            </div>
            <div className='formInput'>
              <label>Email</label>
              <input 
                type="text" 
                name="email"
                value={data.email || ''} 
                onChange={handleInputChange}
              />
            </div>
            <div className='formInput'>
              <label>Nomor Telepon</label>
              <input 
                type="text" 
                name="nomortelepon"
                value={data.nomortelepon || ''} 
                onChange={handleInputChange}
              />
            </div>
            <div className='formInput'>
              <label>Alamat</label>
              <input 
                type="text" 
                name="alamat"
                value={data.alamat || ''} 
                onChange={handleInputChange}
              />
            </div>
              <button type="submit">Kirim</button>
              <button type="button" onClick={handleCancel}>Batal</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditSupir;
