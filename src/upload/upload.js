const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file must be jpg or jpeg or png'));
        }
        cb(undefined, true);
    }
})


module.exports = upload;