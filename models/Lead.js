const { Schema, model } = require('mongoose')
const { ObjectId } = Schema.Types

const LeadSchema = new Schema({
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
  customerService: {
    type: ObjectId,
    ref: 'CustomerService',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  }
})

module.exports = model('Lead', LeadSchema)
