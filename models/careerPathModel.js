const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

const CareerPath = mongoose.model('CareerPath', careerPathSchema);
module.exports = CareerPath;
