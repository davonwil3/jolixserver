const express = require('express');
const router = express.Router();
const { generateText } = require('../controllers/aiapi');
const { rephraseText } = require('../controllers/aiapi');
const { summarize } = require('../controllers/aiapi');
const { generateCitation } = require('../controllers/aiapi');
const { chatbot } = require('../controllers/aiapi');
const {loadMessages} = require('../controllers/aiapi');
const {addUser} = require('../controllers/databaseactions');
const {newProject} = require('../controllers/databaseactions');
const {getProjects} = require('../controllers/databaseactions');
const {saveProject} = require('../controllers/databaseactions');
const {getallProjects} = require('../controllers/databaseactions');
const{deleteProject} = require('../controllers/databaseactions');
const {renameProject} = require('../controllers/databaseactions');

// Define the route and attach it to the controller
router.post('/generate-text', generateText);
router.post('/rephrase-text', rephraseText);
router.post('/summarize', summarize);
router.post('/generate-citation', generateCitation);
router.post('/chatbot', chatbot);
router.post('/loadmessages', loadMessages);
router.post('/adduser', addUser);
router.post('/newproject', newProject);
router.get('/getprojects/:projectId/:userId', getProjects);
router.put('/saveproject', saveProject);
router.get('/getallprojects/:userId', getallProjects);
router.delete('/deleteproject', deleteProject);
router.put('/renameproject', renameProject);




module.exports = router;
