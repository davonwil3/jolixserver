const User = require('../models/schemas').User;
const Project = require('../models/schemas').Project;

const addUser = async (req, res) => {
    const { firebaseUid, email } = req.body;
    const newUser = new User({ firebaseUid, email });
    try {
        const user = await newUser.save();
        console.log('User added:', user);
        res.json({ user });
    } catch (err) {
        res.status(500).send('Failed to add user');
    }
}

const newProject = async (req, res) => {
    let { name, content, firebaseUid } = req.body;
    console.log('New project:', name, content, firebaseUid);

    if (!name || !content) {
        name = 'Untitled Project';
        content = '';
    }

    try {
        const project = new Project({ name, content });
       

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(500).send('Failed to find user');
        }

        user.projects.push(project);
        const updatedUser = await user.save();
        const savedProject = updatedUser.projects[updatedUser.projects.length - 1];

        res.json({ projectId: savedProject.projectId });
    } catch (err) {
        res.status(500).send('Failed to save project');
    }
};

const getProjects = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.params.userId;

        console.log('projectId:', projectId);

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(500).send('Failed to find user');
        }
        console.log('User:', user);
        console.log('Projects:', user.projects);

        const project = user.projects.find(project => project.projectId === Number(projectId));
        console.log('Project found:', project);
        
        res.json({ project: project });
    }
    catch (err) {
        console.error('Error finding user:', err);
        return res.status(500).send('Failed to find user');
    }
}

const getallProjects = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(500).send('Failed to find user');
        }

        res.json({ projects: user.projects });
    }
    catch (err) {
        console.error('Error finding user:', err);
        return res.status(500).send('Failed to find user');
    }
}

const saveProject = async (req, res) => {
    const { projectId, content, name, firebaseUid } = req.body;

    try {
        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(500).send('Failed to find user');
        }

        const project = user.projects.find(project => project.projectId === Number(projectId));
        if (!project) {
            return res.status(500).send('Failed to find project');
        }
        
        if (content) {
            project.content = content;
        }

        if (name) {
            project.name = name;
        }

        project.modified = Date.now();
        await user.save();

        res.json({ projectId });
    } catch (err) {
        res.status(500).send('Failed to save project');
    }
}

const deleteProject = async (req, res) => {
    const { projectId, firebaseUid } = req.body;

    try {
        const user = await User.findOne ({ firebaseUid });
        if (!user) {
            return res.status(500).send('Failed to find user');
        }

        const projectIndex = user.projects.findIndex(project => project.projectId === Number(projectId));
        if (projectIndex === -1) {
            return res.status(500).send('Failed to find project');
        }

        user.projects.splice(projectIndex, 1);
        await user.save();

        res.json({ projectId });

    } catch (err) {
        res.status(500).send('Failed to delete project');
    }
}

const renameProject = async (req, res) => {
    const { projectId, name, firebaseUid } = req.body;

    try {
        const user = await  User.findOne ({ firebaseUid });
        if (!user) {
            return res.status(500).send('Failed to find user');
        }

        const project = user.projects.find(project => project.projectId === Number(projectId));
        if (!project) {
            return res.status(500).send('Failed to find project');
        }

        project.name = name;

        await user.save();

        res.json({ projectId });

    } catch (err) {
        res.status(500).send('Failed to rename project');
    }
}
    


module.exports = {
    addUser,
    newProject,
    getProjects,
    saveProject,
    getallProjects,
    deleteProject,
    renameProject
};