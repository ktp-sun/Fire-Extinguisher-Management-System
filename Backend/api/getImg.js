const express = require('express');
const path = require('path');
const router = express.Router();
const reportModel = require("./DB/report.js");

router.get('/:reportId', async (req, res) => {
    const { reportId } = req.params;
    const report = await reportModel.findOne({ report_id: reportId });
    if (!report || !report.image) {
        return res.status(404).send("File not found");
    }
    const filePath = report.image;
    res.sendFile(path.resolve(filePath), (err) => {
        if (err) {
            return res.status(500).send('Error retrieving file.');
        }
    });
});

module.exports = router;
