import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; 
import { db } from "../../config/firebase/index";
import "./index.css";

const LihatSupir = ({ selectedDocId }) => {
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

  console.log("Rendered with selectedDocId:", selectedDocId);
  console.log("Current data state:", data);

  const handleCancel = () => {
    window.location.href = "/user-manajemen";
  };

  return (
    <>
      <div className='top'>
        <h2>Lihat Akun Supir</h2>
      </div>
      <div className='bottom'>
        <div className='left'>
          <p>Foto Supir</p>
          <img 
            src={photoURL} 
            alt=''
          />
        </div>
        <div className='right'>
          <form>
            <div className='formInput'>
              <label>Nama Panggilan</label>
              <input 
                type="text" 
                value={data.username || ''} 
                readOnly 
                disabled
              />
            </div>
            <div className='formInput'>
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                value={data.namalengkap || ''} 
                readOnly 
                disabled
              />
            </div>
            <div className='formInput'>
              <label>Email</label>
              <input 
                type="text" 
                value={data.email || ''} 
                readOnly 
                disabled
              />
            </div>
            <div className='formInput'>
              <label>Nomor Telepon</label>
              <input 
                type="text" 
                value={data.nomortelepon || ''} 
                readOnly 
                disabled
              />
            </div>
            <div className='formInput'>
              <label>Alamat</label>
              <input 
                type="text" 
                value={data.alamat || ''} 
                readOnly 
                disabled
              />
            </div>
            <button type="button" onClick={handleCancel}>Batal</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LihatSupir;
