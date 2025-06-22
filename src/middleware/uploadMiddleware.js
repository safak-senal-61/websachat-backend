// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Fotoğrafları kaydedeceğimiz dizin
    const uploadPath = path.join(__dirname, '../../public/images/chatroom');

    // Dizin yoksa oluştur
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Dosya çakışmalarını önlemek için benzersiz bir isim oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// 2. Dosya filtresi (sadece resimlere izin ver)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Hata: Sadece resim dosyaları yüklenebilir (jpeg, png, gif, webp).'), false);
};

// 3. Multer'ı yapılandır ve export et
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;