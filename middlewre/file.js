const multer = require('multer')

const storage = multer.diskStorage({
    destination(req, file, collback) {
        collback(null, 'images')
    },
    filename(req, file, collback) {
        collback(null, new Date().toISOString() + '-' + file.originalname)

    }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, collback) => {
    if (allowedTypes.includes(file.mimetype)) {
        collback(null, true)
    } else {
        collback(null, false)
    }
}

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter
})