const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        courseId: {
            type: Number, // Fixed: Changed "number" to "Number"
            required: true, // Optional: Add required if needed
        },
        name: { type: String, required: true },
        description: { type: String },
        relatedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CareerField', // Reference to the CareerField model
            },
        ],
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
