const { Schema, model } = require('mongoose')

const SuperAdminSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 64,
    required: true
  },
  phone: {
    type: String,
    trim: true,
    min: 10,
    max: 16,
    required: true
  },
  password: {
    type: String,
    trim: true,
    min: 1,
    max: 128,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  }
})

module.exports = model('SuperAdmin', SuperAdminSchema)
