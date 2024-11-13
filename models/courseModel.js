const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    careerPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath', required: true },  // Link to career path
    syllabus: [{ type: String }],  // An array of strings to store multiple syllabus links/resources
    careerDestinations: [{
        role: { type: String },
        description: { type: String },
        roadmap: [{ type: String }]  // Multiple roadmap steps/resources for each career role
    }]
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
