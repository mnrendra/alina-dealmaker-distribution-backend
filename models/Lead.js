const { Schema, model } = require('mongoose')
const { ObjectId } = Schema.Types

const Logs = new Schema({
  type: {
    type: String,
    enum: ['LEADING'],
    required: true
  },
  noted: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: {
    createdAt: 'timestamps',
    updatedAt: false
  },
  minimize: false,
  _id: false
})

const LeadSchema = new Schema({
  idNumber: {
    type: String,
    trim: true,
    minlength: 15,
    maxlength: 15,
    default: 'YYMMDD-hhmmss-0'
  },
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
  },
  googleContact: {
    type: Schema.Types.Mixed,
    default: {}
  },
  logs: [Logs]
}, {
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  },
  minimize: false
})

module.exports = model('Lead', LeadSchema)
