const mongoose = require('mongoose');

const TimeSeriesSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        index: true // Index for faster queries
    },
    metadata: {
        total_messages: Number,
        valid_messages: Number,
        invalid_messages: Number
    },
    data: [{
        name: String,
        origin: String,
        destination: String,
        secret_key: String,
        timestamp: Date
    }]
}, { timestamps: true });


module.exports = mongoose.model('TimeSeries', TimeSeriesSchema);
