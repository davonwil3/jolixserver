const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const AutoIncrement = AutoIncrementFactory(mongoose);


const ProjectSchema = new mongoose.Schema({
    projectId: Number,
    name: String,
    content: String,
    chat: String,
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },


});

ProjectSchema.plugin(AutoIncrement, {inc_field: 'projectId'});


const UserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    projects: [ProjectSchema],
});

const Project = mongoose.model('Project', ProjectSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Project, User };