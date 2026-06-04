
const reportModel = require("./DB/report.js");

async function getAllReport() {
    try {
        return await reportModel.find({}, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getAllReportByStatus(status) {
    try {
        return await reportModel.find({ status: status }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportByCom(company) {
    try {
        return await reportModel.find({ "client_id": company }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportByBranch(company, branch) {
    try {
        return await reportModel.find({ "client_id": company, "client_branch_id": branch }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportStatusByBranch(company, branch, status) {
    try {
        return await reportModel.find({ "client_id": company, "client_branch_id": branch, status: status }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportByBranchCount(company, branch) {
    try {
        const docs = await reportModel.find({ "client_id": company, "client_branch_id": branch }, { _id: 0 }).lean();
        return docs.length;
    } catch (error) {
        console.error('Error fetching data:', error);
        return 0;
    }
}

async function getReportStatusByCom(company, status) {
    try {
        return await reportModel.find({ "client_id": company, status: status }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportById(id) {
    try {
        if (!id || id.trim() === "") {
            throw new Error("ID must not be empty");
        }
        const docs = await reportModel.find({ "report_id": id }, { _id: 0 }).lean();
        return docs.length ? docs : null;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getReportByUser(user) {
    try {
        return await reportModel.find({ "send_by": user }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportByStatus(status) {
    try {
        return await reportModel.find({ "status": status }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportByUserDone(user) {
    try {
        return await reportModel.find({ "send_to": user, "status": "done" }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function getReportByUserFixing(user) {
    try {
        return await reportModel.find({ "send_to": user, "status": "fixing" }, { _id: 0 }).lean();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function createReport(company, branch, id, data, file) {
    try {
        const currentYear = new Date().getFullYear();
        const regex = new RegExp(`^RP-${currentYear}-\\d{7}$`, 'i');

        const lastItem = await reportModel.findOne({ report_id: { $regex: regex } })
            .sort({ report_id: -1 })
            .lean();
        
        let lastNumber = 1;
        
        if (lastItem && lastItem.report_id) {
            const parts = lastItem.report_id.split("-");
            if (parts.length === 3) {
                lastNumber = parseInt(parts[2], 10) + 1;
            }
        }
        const newReportId = `RP-${new Date().getFullYear()}-${lastNumber.toString().padStart(7, '0')}`;
        const filePath = file ? file.path : null;
        const newReport = await reportModel.create({
            report_id: newReportId,
            item_id: id,
            client_id: company,
            client_branch_id: branch,
            createAt: new Date().toISOString(),
            status: "pending",
            send_by: data.user.username,
            send_to: data.send_to,
            problem: data.problem,
            image: filePath,
            note: data.note
        });

        return newReport ? true : false;
    } catch (error) {
        console.log("Error adding new report:", error);
        return false;
    }
}


async function updateReport(ids, status, send_to, note) {
    try {
        const docs = await reportModel.find({ "report_id": { $in: ids } });
        if (!docs.length) {
            return { success: false, message: 'No reports found for the provided IDs' };
        }

        const itemIds = [];
        for (const doc of docs) {
            doc.set({
                "report_id": doc.report_id,
                "item_id": doc.item_id,
                "client_id": doc.client_id,
                "client_branch_id": doc.client_branch_id,
                "createAt": doc.createAt,
                "status": status,
                "send_by": doc.send_by,
                "send_to": send_to || doc["send_to"],
                "problem": doc.problem,
                "note": note || doc.note
            });

            await doc.save();
            itemIds.push(doc.item_id);
        }

        const itemStatus = getItemStatusByReportStatus(status);
        return { success: true, itemIds, itemStatus, status: docs[0].status };
    } catch (error) {
        console.error('Error updating report:', error);
        return { success: false, message: 'Error updating report' };
    }
}

function getItemStatusByReportStatus(reportStatus) {
    switch (reportStatus) {
        case 'pending':
            return 'reporting';
        case 'accepted':
            return 'bad';
        case 'fixing':
            return 'fixing';
        case 'done':
        case 'rejected':
        default:
            return 'available';
    }
}

async function deleteReport(id, status) {
    try {
        const result = await reportModel.deleteMany({ "item_id": { $in: id }, status: status });
        return result.deletedCount;
    } catch (error) {
        console.error("Error deleting report:", error);
        throw new Error("Failed to delete report");
    }
}


module.exports = {
    createReport,
    getAllReport,
    getAllReportByStatus,
    getReportByBranch,
    getReportByBranchCount,
    getReportByCom,
    getReportById,
    getReportByStatus,
    getReportByUser,
    getReportByStatus,
    getReportByUserFixing,
    getReportByUserDone,
    getReportStatusByBranch,
    getReportStatusByCom,
    updateReport,
    deleteReport
};

