const CompanyModel = require('./DB/client.js');

async function getAllCompany() {
    try {
        const data = await CompanyModel.find({}, { client_id: 1, _id: 0 }).lean();
        const uniqueCompanies = [...new Set(data.map(item => item.client_id))];
        return uniqueCompanies.map(client_id => ({ client_id }));
    } catch (error) {
        console.log(error);
    }
}

async function getCompanyInfo(company) {
    try{
        const data = await CompanyModel.find({ client_id: company }, { _id: 0 }).lean();
        const formatData = data.map(item => {
            return {
                    client_branch_id: item.client_branch_id,
                    location: item.location,
                    next_check: item.next_check,
                    last_check: item.last_check
            };
        });
        let companyInfo = {};
        companyInfo[company] = formatData;
        return companyInfo;
    }catch (error) {
        console.log(error);
    }
}

async function getBranchList(company) {
    try {
        const data = await CompanyModel.find({ client_id: company }, { client_branch_id: 1, _id: 0 }).lean();
        return data;
    } catch (error) {
        console.log(error);
    }
}

async function getCompanyBranch() {
    try {
        const data = await CompanyModel.find({}, { client_id: 1, client_branch_id: 1, _id: 0 }).lean();
        const uniqueCompanies = [...new Set(data.map(item => item.client_id))];
        const result = {};
        uniqueCompanies.forEach(client_id => {
            result[client_id] = data.filter(item => item.client_id === client_id).map(item => item.client_branch_id);
        });
        return result;
    } catch (error) {
        throw error;
    }
}

async function getNextCheck(company, branch) {
    try {
        const result = await CompanyModel.findOne(
            { client_id: company, 'client_branch_id': branch },
            { 'next_check': 1, _id: 0 }
        ).lean();
        return result.next_check;
    } catch (error) {
        console.error(`Error fetching next check for ${company}/${branch}:`, error);
        return null;
    }
}

async function getLastCheck(company) {
    try {
        const result = await CompanyModel.findOne(
            { client_id: company },
            { 'last_check': 1, _id: 0 }
        ).lean();
        return result.last_check;
    } catch (error) {
        console.error(`Error fetching last check for ${company}:`, error);
        return null;
    }
}

async function getLocation(company, branch) {
    try {
        const result = await CompanyModel.findOne(
            { client_id: company, 'client_branch_id': branch },
            { _id: 0 }
        ).lean();
        return result.location;
    } catch (error) {
        console.error(`Error fetching location for ${company}/${branch}:`, error);
        return null;
    }
}

async function createCompany(company, branch, location) {
    try {
        const findSame = await CompanyModel.findOne({ client_id: company, client_branch_id: branch });
        if (findSame) {
            return false;
        }
        await CompanyModel.create({
            client_id: company,
            client_branch_id: branch,
            location: {
                ...location
            },
            next_check: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
            last_check: []

        });
        return true;
    } catch (error) {
        console.error(`Error creating company ${data.client_id}:`, error);
        return null;
    }
}

async function updateCompany(company, branch, location) {
    try {
        const result = await CompanyModel.updateOne(
            {
                client_id: company,
                client_branch_id: branch
            },
            {
                $set: { location: location }
            }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error(`Error updating company ${company} branch ${branch}:`, error);
        throw error;
    }
}


async function deleteCompany(company, branch) {
    try {
        const result = await CompanyModel.deleteOne({
            client_id: company,
            client_branch_id: branch
        });
        return result.deletedCount > 0;
    } catch (error) {
        console.error(`Error deleting company ${company} branch ${branch}:`, error);
        return false;
    }
}


module.exports = { getAllCompany, getCompanyInfo, getBranchList, getCompanyBranch, getNextCheck, getLastCheck,getLocation, createCompany, updateCompany, deleteCompany };
