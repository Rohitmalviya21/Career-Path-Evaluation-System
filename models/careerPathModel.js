const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
    careerPathId: { // Fixed typo in property name
        type: Number, // Changed "number" to "Number"
        required: true // Optional: Add required if applicable
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

const CareerPath = mongoose.model('CareerPath', careerPathSchema);
module.exports = CareerPath;
