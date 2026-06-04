const express = require('express');
const router = express.Router();
const activityFunc = require('./activityLog');
const {auth, authSuperMember, authWorkerAndAdmin, authAdmin} = require('./auth');

router.get('/all', authAdmin, async (req, res) => {
    try {
        const logs = await activityFunc.getActivityLog();
        if (!logs || logs.length === 0) {
            return res.status(404).json({ 
                message: 'No activity logs found',
                suggestion: 'Check if collection exists and contains data'
            });
        }
        res.json(logs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
});

router.get('/worker', authWorkerAndAdmin, async (req, res) => {
    try {
        const username = req.user.username;
        const logs = await activityFunc.getActivityByUsername(username);
        if (!logs || logs.length === 0) {
            return res.status(404).json({ 
                message: 'No activity logs found for this worker',
                suggestion: 'Ensure this user has logged some activities'
            });
        }
        res.json(logs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
});

router.get('/login-logout', authSuperMember, async (req, res) => {
    try {
        const logs = await activityFunc.getActivityLoginLogout();
        if (!logs || logs.length === 0) {
            return res.status(404).json({ 
                message: 'No activity logs found',
                suggestion: 'Check if collection exists and contains data'
            });
        }
        res.json(logs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
});

router.get('/login-logout/:client_id', authSuperMember, async (req, res) => {
    const { client_id } = req.params;
    try {
        const logs = await activityFunc.getActivityLoginLogout(client_id);
        if (!logs || logs.length === 0) {
            return res.status(404).json({ 
                message: 'No activity logs found',
                suggestion: 'Check if collection exists and contains data'
            });
        }
        res.json(logs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
});



router.post('/create', async (req, res) => {
    try {
        const logData = req.body;
        const newLog = await activityFunc.createLog(logData);
        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({
            message: 'Error creating activity log',
            error: error.message
        });
    }
});


module.exports = router;
