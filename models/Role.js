const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    concerningId: {
        type: String,
        default: "",
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Role', roleSchema)