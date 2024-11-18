const mongoose = require('mongoose');

const careerFieldSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true // Removes extra whitespace
        },
        description: {
            type: String,
            trim: true // Removes extra whitespace
        },
        skills: {
            type: [String],
            validate: {
                validator: function (arr) {
                    return arr.every(skill => typeof skill === 'string' && skill.trim().length > 0);
                },
                message: 'Each skill must be a non-empty string.'
            }
        },
        avgSalary: {
            type: String,

        },
        demand: {
            type: String,

        },
        type: [String],
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the model using the schema
const CareerField = mongoose.model('CareerField', careerFieldSchema);

// Export the model
module.exports = CareerField;
