const express = require('express');
require('dotenv').config();
const axios = require("axios"); 
const cors = require('cors');
const cloudinary = require("cloudinary").v2;

const Multer = require("multer");

cloudinary.config({
    cloud_name: 'dpi7jmux1',
    api_key: '928512198332682',
    api_secret: 'zfUDj0BZpECd4Vdq6GyuJ0UsQXI',
  });
  
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

  async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
  }


