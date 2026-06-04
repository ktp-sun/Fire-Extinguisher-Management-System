const express = require('express');
const router = express.Router();
const CompanyModel = require('./DB/companyModal.js'); // ✅ ตรวจสอบชื่อไฟล์

// ดึงรายการสาขาทั้งหมดของบริษัทจาก MongoDB
async function getCompanyBranches(companyName) {
  try {
    const companyData = await CompanyModel.findOne({});
    
    if (!companyData) {
      return { success: false, message: "No company data found in the database" };
    }

    console.log("📌 Company Data from DB:", companyData);

    // แปลงข้อมูลเป็น Object และกรอง `_id` ออก
    const companyObj = companyData.toObject();
    const companyKeys = Object.keys(companyObj).filter(key => key !== "_id");

    console.log("🏷️ Available Companies:", companyKeys);

    if (!companyKeys.includes(companyName)) {
      return { success: false, message: `Company '${companyName}' not found` };
    }

    const branches = companyObj[companyName].branch || {};
    console.log(`📁 Branches of ${companyName}:`, branches);

    return {
      success: true,
      data: Object.entries(branches).map(([branchName, branchData]) => ({
        branchName,
        ...branchData
      }))
    };
  } catch (error) {
    console.error("❌ Error fetching company branches:", error);
    return { success: false, message: error.message };
  }
}


// ดึงข้อมูลของสาขาเดี่ยว
async function getSingleBranch(companyName, branchName) {
  try {
    const companyData = await CompanyModel.findOne({});

    if (!companyData) {
      return { success: false, message: "No company data found in the database" };
    }

    console.log("📌 Company Data from DB:", companyData);

    // แปลงข้อมูลเป็น Object และกรอง `_id` ออก
    const companyObj = companyData.toObject();
    const companyKeys = Object.keys(companyObj).filter(key => key !== "_id");

    if (!companyKeys.includes(companyName)) {
      return { success: false, message: `Company '${companyName}' not found` };
    }

    const branches = companyObj[companyName].branch || {};

    if (!branches[branchName]) {
      return { success: false, message: `Branch '${branchName}' not found in company '${companyName}'` };
    }

    console.log(`🏢 Company: ${companyName} -> 🏬 Branch: ${branchName}`, branches[branchName]);

    return {
      success: true,
      data: {
        branchName,
        ...branches[branchName]
      }
    };
  } catch (error) {
    console.error("❌ Error fetching branch details:", error);
    return { success: false, message: error.message };
  }
}


// ดึงข้อมูลทุกบริษัทและสาขา
async function getAllBranches() {
  try {
    const companies = await CompanyModel.find({});
    console.log("📌 All companies from DB:", companies);

    const result = {};

    companies.forEach((company) => {
      console.log("🔍 Company data:", company);

      // ตรวจสอบว่าข้อมูลใน MongoDB ถูกเก็บแบบ Object ที่ไม่มีฟิลด์ name
      const companyKeys = Object.keys(company.toObject()).filter(key => key !== "_id"); // กรอง _id ออก
      console.log("🏷️ Company keys:", companyKeys);

      companyKeys.forEach(companyName => {
        console.log("✅ Using company name:", companyName);

        result[companyName] = company[companyName].branch
          ? Object.entries(company[companyName].branch).map(([branchName, branchData]) => ({
              branchName,
              ...branchData
            }))
          : [];

        console.log(`📁 Branches of ${companyName}:`, result[companyName]);
      });
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error fetching all branches:", error);
    return { success: false, message: error.message };
  }
}

// API Routes
router.get('/:companyName', async (req, res) => {
  const result = await getCompanyBranches(req.params.companyName);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(404).json({ error: result.message });
  }
});

router.get('/:companyName/:branchName', async (req, res) => {
  const result = await getSingleBranch(req.params.companyName, req.params.branchName);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(404).json({ error: result.message });
  }
});

router.get('/', async (req, res) => {
  const result = await getAllBranches();
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});



module.exports = router;
