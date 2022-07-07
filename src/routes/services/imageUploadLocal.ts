import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/public/')
    }, 

    filename: function (req, file, cb) {
        cb(null, new Date(Date.now()).toISOString() + '_' + (file.originalname))
    }
})

const upload = multer({ storage: storage });

export { upload };