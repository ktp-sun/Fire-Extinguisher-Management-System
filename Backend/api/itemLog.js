const express = require('express');
const router = express.Router();
const logModel = require('./DB/logItem.js');


async function getAllLog() {
    try {
        return await logModel.find({}).lean();
    } catch (error) {
        console.error('Error creating log:', error);
        return null;
    }
}

async function createLog(data) {
    try {
        const lastItem = await logModel.countDocuments({ "log_id": { $regex: `ITEMLOG-${new Date().getFullYear()}`, $options: "i" } });
        const lastNumber = lastItem + 1;
        const newId = `ITEMLOG-${new Date().getFullYear()}-${(lastNumber).toString().padStart(7, '0')}`;
        return await logModel.create({
            log_id: newId,
            item_id: data[0],
            date: new Date().toISOString(),
            activity: data[1],
            username: data[2],
            role: data[3],
        });
    } catch (error) {
        console.error('Error creating log:', error);
        return null;
    }
}

module.exports = {
    getAllLog,
    createLog
};


