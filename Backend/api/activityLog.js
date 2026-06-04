const activityLogModal = require('./DB/activityLogModal.js');

async function getActivityLog() {
    try {
        return await activityLogModal.find({}).lean();
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }
}

async function getActivityByUsername(username) {
    try {
        return await activityLogModal.find({ username }).lean();
    } catch (error) {
        console.error('Error fetching activity logs for user:', error);
        return [];
    }
}

async function getActivityLoginLogout(client) {
    if (client) {
        try {
            return await activityLogModal.find({ activity: { $in: ["Log in", "Log out"] }, client: client }).lean();
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            return [];
        }
    }
    
    try {
        return await activityLogModal.find({ activity: { $in: ["Log in", "Log out"] } }).lean();
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }
}

async function createLog(data) {
    try {
        const lastItem = await activityLogModal.countDocuments({ "log_id": { $regex: `LOG-${new Date().getFullYear()}`, $options: "i" } });
        const lastNumber = lastItem + 1;
        const newId = `LOG-${new Date().getFullYear()}-${(lastNumber).toString().padStart(7, '0')}`;
        return await activityLogModal.create({ 
            log_id: newId,
            date: new Date().toISOString(),
            activity: data[0],
            username: data[1],
            role: data[2],
            client : data[3]
        });
    } catch (error) {
        console.error('Error creating log:', error);
        return null;
    }
}

module.exports = {
    getActivityLog,
    getActivityLoginLogout,
    createLog,
    getActivityByUsername
};
