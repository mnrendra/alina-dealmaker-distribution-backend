const { Schema, model } = require('mongoose')

const CustomerServiceSchema = new Schema({
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
  },
  active: {
    type: Boolean,
    default: false
  },
  isTurn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  }
})

module.exports = model('CustomerService', CustomerServiceSchema)
