const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    syllabus: [{ type: String }],
    careerField: {
        name: { type: String },
        roadmap: [{ type: String }]  
    },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
