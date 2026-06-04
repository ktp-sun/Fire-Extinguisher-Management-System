const express = require('express');
const router = express.Router();
const logFunc = require('./itemLog.js');
const {authWorkerAndAdmin} = require('./auth');

router.get('/getAllLog', authWorkerAndAdmin, async (req, res) => {
    try {
        const logs = await logFunc.getAllLog();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs' });
    }
});



module.exports = router;


