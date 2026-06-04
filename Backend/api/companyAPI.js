const express = require('express');
const router = express.Router();
const companyFunc = require('./company');
const {auth, authSuperMember, authWorkerAndAdmin, authAdmin} = require('./auth');
const CompanyModel = require('./DB/client.js');
const itemModel = require("./DB/item.js");

router.get('/getAllCompany', authWorkerAndAdmin, async (req, res) => {
    try {
        const count = await companyFunc.getAllCompany();
        res.json( count );
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all company' });
    }
});

router.get('/getCompanyInfo/:company', authWorkerAndAdmin, async (req, res) => {
    const { company } = req.params;
    try {
        const companyInfo = await companyFunc.getCompanyInfo(company);
        if (!companyInfo) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(companyInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company info' });
    }
});

router.get('/getAllBranch/:company', auth, async (req, res) => {
    const { company } = req.params;
    try {
        const branch = await companyFunc.getBranchList(company);
        if (branch.length === 0) {
            return res.status(404).json(branch);
        }
        res.json( branch );
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branch'});
    }
});

router.get('/getCompanyBranch/', authSuperMember, async (req, res) => {
    try {
        const branches = await companyFunc.getCompanyBranch();
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company branches' });
    }
});

router.get('/getNextCheck/:company/:branch', auth, async (req, res) => {
    const { company, branch } = req.params;
    try {
        const nextCheck = await companyFunc.getNextCheck(company, branch);
        res.json(nextCheck);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching next check' });
    }
});

router.get('/getLastCheck/:company/:branch', auth, async (req, res) => {
    const { company, branch } = req.params;
    try {
        const lastCheck = await companyFunc.getLastCheck(company, branch);
        res.json(lastCheck);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching last check' });
    }
});

router.get('/getLocation/:company/:branch', auth, async (req, res) => {
    const { company, branch } = req.params;
    try {
        const companyInfo = await companyFunc.getLocation(company, branch);
        res.json(companyInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company info' });
    }
});

router.post('/createCompany/:company/:branch', authAdmin, async (req, res) => {
    const { company, branch } = req.params;
    const { location } = req.body;
    try {
        const newCompany = await companyFunc.createCompany(company, branch, location);
        res.status(201).json(newCompany);
    } catch (error) {
        res.status(500).json({ message: 'Error creating company' });
    }
})

router.put('/updateCompany/:company/:branch', authWorkerAndAdmin, async (req, res) => {
    const { company, branch } = req.params;
    const { location } = req.body;
    
    try {
        const updateResult = await companyFunc.updateCompany(company, branch, location);
        
        if (updateResult) {
            const updatedBranch = await CompanyModel.findOne({ // Make sure ClientModel is imported
                client_id: company,
                client_branch_id: branch
            }).lean();
            
            if (!updatedBranch) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Branch not found after update' 
                });
            }
            
            res.status(200).json({
                success: true,
                message: `Branch updated successfully`,
                data: updatedBranch
            });
        } else {
            res.status(200).json({
                success: false,
                message: `No changes made to the branch` 
            });
        }
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating company',
            error: error.message 
        });
    }
});

router.delete('/deleteCompany/:company/:branch', authAdmin, async (req, res) => {
    const { company, branch } = req.params;
    try {
        const deleteCompany = await companyFunc.deleteCompany(company, branch);
        if (deleteCompany) {
            await itemModel.deleteMany({ client_id: company, client_branch_id: branch });
            res.json({ message: `Company ${company} ${branch} deleted successfully` });
        } else {
            res.status(500).json({ message: `Error deleting company ${company} ${branch}` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting company' });
    }
})
module.exports = router;
