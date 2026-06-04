const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'img');
  },
  filename: function (req, file, cb) {
    const reportId = `${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${reportId}${ext}`);
  }
});

const upload = multer({ storage: storage });

const reportFunc = require("./report");
const itemFunc = require("./item");
const logItemFunc = require("./itemLog");
const activityLogFunc = require("./activityLog");
const {
  auth,
  authSuperMember,
  authWorkerAndAdmin,
  authAdmin,
} = require("./auth");

const handleError = (res, message, error = null, statusCode = 500) => {
  console.error(message, error || "");
  res.status(statusCode).json({ message });
};

const validateParams = (params, res) => {
  for (const [key, value] of Object.entries(params)) {
    if (!value?.trim()) {
      return res.status(400).json({ message: `${key} must not be empty` });
    }
  }
  return true;
};


router.get("/getAllReport", authAdmin, async (req, res) => {
  try {
    const data = await reportFunc.getAllReport();
    res.json(data);
  } catch (error) {
    handleError(res, "Error fetching reports", error);
  }
});

router.get("/getAllReport/count", authAdmin, async (req, res) => {
  try {
    const count = await reportFunc.getAllReport();
    res.json(count.length);
  } catch (error) {
    handleError(res, "Error fetching report count", error);
  }
});


router.get(
  "/getAllReportByStatus/:status",
  authWorkerAndAdmin,
  async (req, res) => {
    const { status } = req.params;
    if (!status) {
      return res.status(400).json({ message: "Status must not be empty" });
    }
    try {
      const data = await reportFunc.getAllReportByStatus(status);
      res.json(data);
    } catch (error) {
      handleError(res, "Error fetching reports by status", error);
    }
  }
);

router.get(
  "/getAllReportByStatus/count/:status",
  authWorkerAndAdmin,
  async (req, res) => {
    const { status } = req.params;
    if (!status) {
      return res.status(400).json({ message: "Status must not be empty" });
    }
    try {
      const data = await reportFunc.getAllReportByStatus(status);
      res.json(data.length);
    } catch (error) {
      handleError(res, "Error fetching reports by status", error);
    }
  }
);

router.get(
  "/getReportByUserDone/:user",
  authWorkerAndAdmin,
  async (req, res) => {
    const { user } = req.params;
    if (!validateParams({ user }, res)) return;

    try {
      const data = await reportFunc.getReportByUserDone(user);
      if (!data || data.length === 0) {
        return res
          .status(404)
          .json({ message: "No done reports found for this user" });
      }
      res.json(data);
    } catch (error) {
      handleError(res, "Error fetching done reports by user", error);
    }
  }
);

router.get(
  "/getReportByUserFixing/:user",
  authWorkerAndAdmin,
  async (req, res) => {
    const { user } = req.params;
    if (!validateParams({ user }, res)) return;

    try {
      const data = await reportFunc.getReportByUserFixing(user);
      if (!data) {
        return res
          .status(404)
          .json({ message: "No fixing reports found for this user" });
      }
      res.json(data);
    } catch (error) {
      handleError(res, "Error fetching fixing reports by user", error);
    }
  }
);

router.get("/getReportByUser/:user", authWorkerAndAdmin, async (req, res) => {
  const { user } = req.params;
  if (!validateParams({ user }, res)) return;

  try {
    const data = await reportFunc.getReportByUser(user);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(data);
  } catch (error) {
    handleError(res, "Error fetching reports by user", error);
  }
});


router.get("/getReportByCom/:company", authSuperMember, async (req, res) => {
  const { company } = req.params;
  if (!validateParams({ company }, res)) return;

  if (req.user.role === "Super Member" && req.user.client !== company) {
    return res
      .status(403)
      .json({ message: "Access denied to this company data" });
  }

  try {
    const data = await reportFunc.getReportByCom(company);
    res.json(data);
  } catch (error) {
    handleError(res, "Error fetching reports by company", error);
  }
});

router.get(
  "/getReportByComCount/:company",
  authSuperMember,
  async (req, res) => {
    const { company } = req.params;
    if (!validateParams({ company }, res)) return;

    if (req.user.role === "Super Member" && req.user.client !== company) {
      return res
        .status(403)
        .json({ message: "Access denied to this company data" });
    }

    try {
      const count = await reportFunc.getReportByCom(company);
      res.json(count.length);
    } catch (error) {
      handleError(res, "Error fetching report count by company", error);
    }
  }
);


router.get("/getReportByBranch/:company/:branch", auth, async (req, res) => {
  const { company, branch } = req.params;
  if (!validateParams({ company, branch }, res)) return;

  if (req.user.role === "Super Member" && req.user.client !== company) {
    return res
      .status(403)
      .json({ message: "Access denied to this branch data" });
  }
  if (req.user.role === "Member" && !req.user.client_access.includes(branch)) {
    return res
      .status(403)
      .json({ message: "Access denied to this branch data" });
  }

  try {
    const data = await reportFunc.getReportByBranch(company, branch);
    res.json(data);
  } catch (error) {
    handleError(res, "Error fetching reports by branch", error);
  }
});

router.get(
  "/getReportStatusByCom/:company/:status",
  authSuperMember,
  async (req, res) => {
    const { company, status } = req.params;
    if (!validateParams({ company, status }, res)) return;

    if (req.user.role === "Super Member" && req.user.client !== company) {
      return res
        .status(403)
        .json({ message: "Access denied to this company data" });
    }

    try {
      const data = await reportFunc.getReportStatusByCom(company, status);
      res.json(data);
    } catch (error) {
      handleError(res, "Error fetching reports by company and status", error);
    }
  }
);

router.get(
  "/getReportStatusByCom/count/:company/:status",
  authSuperMember,
  async (req, res) => {
    const { company, status } = req.params;
    if (!validateParams({ company, status }, res)) return;

    if (req.user.role === "Super Member" && req.user.client !== company) {
      return res
        .status(403)
        .json({ message: "Access denied to this company data" });
    }

    try {
      const count = await reportFunc.getReportStatusByCom(company, status);
      res.json(count.length);
    } catch (error) {
      handleError(
        res,
        "Error fetching report count by company and status",
        error
      );
    }
  }
);

router.get(
  "/getReportStatusByBranch/:company/:branch/:status",
  auth,
  async (req, res) => {
    const { company, branch, status } = req.params;
    if (!validateParams({ company, branch, status }, res)) return;

    if (req.user.role === "Super Member" && req.user.client !== company) {
      return res
        .status(403)
        .json({ message: "Access denied to this branch data" });
    }
    if (
      req.user.role === "Member" &&
      !req.user.client_access.includes(branch)
    ) {
      return res
        .status(403)
        .json({ message: "Access denied to this branch data" });
    }

    try {
      const data = await reportFunc.getReportStatusByBranch(
        company,
        branch,
        status
      );
      res.json(data);
    } catch (error) {
      handleError(res, "Error fetching reports by branch and status", error);
    }
  }
);

router.get(
  "/getReportStatusByBranch/count/:company/:branch/:status",
  auth,
  async (req, res) => {
    const { company, branch, status } = req.params;
    if (!validateParams({ company, branch, status }, res)) return;

    if (req.user.role === "Super Member" && req.user.client !== company) {
      return res
        .status(403)
        .json({ message: "Access denied to this branch data" });
    }
    if (
      req.user.role === "Member" &&
      !req.user.client_access.includes(branch)
    ) {
      return res
        .status(403)
        .json({ message: "Access denied to this branch data" });
    }

    try {
      const data = await reportFunc.getReportStatusByBranch(
        company,
        branch,
        status
      );
      res.json(data.length);
    } catch (error) {
      handleError(res, "Error fetching reports by branch and status", error);
    }
  }
);


router.get("/getReportById/:id", authWorkerAndAdmin, async (req, res) => {
  const { id } = req.params;
  if (!validateParams({ id }, res)) return;

  try {
    const data = await reportFunc.getReportById(id);
    res.json(data);
  } catch (error) {
    handleError(res, "Internal server error", error);
  }
});


router.post("/createReport/:id", upload.single('image'), async (req, res) => {
  const { id } = req.params;
  let { data } = req.body;
  let user = req.body.user || { user: "guest", role: "guest" };
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON format for data." });
    }
  }
  if (typeof user === 'string') {
    try {
      user = JSON.parse(user);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON format for user." });
    }
  }
  if (!validateParams({ id }, res)) {
    return res.status(400).json({ message: "Incomplete data" });
  }
  try {
    const item = await itemFunc.checkItemExist(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.item_status === "fixing" || item.item_status === "bad"){
      return res.status(400).json({ message: "Item is already in fixing" });
    } 
    const report = await reportFunc.createReport(
      item.client_id,
      item.client_branch_id,
      id,
      data,
      req.file
    );
    await itemFunc.updateStatus([id], "reporting");
    await logItemFunc.createLog([item.item_id, "reporting", user.username, user.role]);
    await activityLogFunc.createLog(["reporting", user.username, user.role]);

    res.json(report);
  } catch (error) {
    handleError(res, "Error creating report", error);
  }
});


router.put("/updateReport/:status", authWorkerAndAdmin, async (req, res) => {
  const { status } = req.params;
  const { ids, send_to } = req.body;
  const { user } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "IDs are required and should be an array" });
  }
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const validStatuses = ["pending", "accepted", "fixing", "done", "rejected"];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const updateResult = await reportFunc.updateReport(
      ids,
      status.toLowerCase(),
      send_to,
      req.body.note
    );
    if (!updateResult.success) return res.status(404).json({ message: updateResult.message });
    if (status.toLowerCase() === "accepted" || status.toLowerCase() === "rejected") await reportFunc.deleteReport(updateResult.itemIds, "pending");
      const updateStatusResult = await itemFunc.updateStatus(
      updateResult.itemIds,
      updateResult.itemStatus
    );
    if (!updateStatusResult)
      return res.status(404).json({ message: "Error updating item status" });
      await activityLogFunc.createLog([
      status.toLowerCase(),
      user.username,
      user.role,
    ]);
    await logItemFunc.createLog([
      updateStatusResult[0],
      updateResult.itemStatus === "fixing" ? "assigned to worker" : updateResult.itemStatus === "accepted" ? "work accepted" : updateResult.itemStatus === "rejected" ? "work rejected" : updateResult.itemStatus,
      user.username,
      user.role,
    ]);
    res.json({ message: "Report and items updated successfully" });
  } catch (error) {
    handleError(res, "Error updating report", error);
  }
});

router.get(
  "/getReportByStatus/:status",
  authWorkerAndAdmin,
  async (req, res) => {
    const status = req.params.status;

    if (!status) {
      return res.status(400).json({ message: "Status must not be empty" });
    }
    try {
      const data = await reportFunc.getReportByStatus(status);
      res.json(data);
    } catch (error) {
      handleError(res, "Error fetching reports by status", error);
    }
  }
);

module.exports = router;
