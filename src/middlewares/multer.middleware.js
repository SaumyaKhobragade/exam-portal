import multer  from "multer";

const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp');
    },
    filename: function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ storage });

export default upload;
