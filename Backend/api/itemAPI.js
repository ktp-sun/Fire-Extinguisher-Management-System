const express = require("express");
const router = express.Router();
const itemFunc = require("./item");
const logItemFunc = require("./itemLog");
const {
  auth,
  authSuperMember,
  authWorkerAndAdmin,
} = require("./auth");


router.get("/getAllItem", authWorkerAndAdmin, async (req, res) => {
  try {
    const items = await itemFunc.getAllItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

router.get("/getAllItem/count", authWorkerAndAdmin, async (req, res) => {
  try {
    const count = await itemFunc.getAllItems();
    res.json(count.length);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item count" });
  }
});

router.get("/getItemList/:company", authSuperMember, async (req, res) => {
  const { company } = req.params;
  try {
    const items = await itemFunc.getItemCompany(company);
    if (!items.length) return res.status(404).json(items);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

router.get("/getItemList/count/:company", authSuperMember, async (req, res) => {
  const { company } = req.params;
  try {
    const count = await itemFunc.getItemCompany(company);
    if (!count) return res.status(404).json(count);
    res.json(count.length);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item count" });
  }
});

router.get("/getItemList/:company/:branch", auth, async (req, res) => {
  const { company, branch } = req.params;
  try {
    const items = await itemFunc.getItemCompanyBranch(company, branch);
    if (!items.length) return res.status(404).json(items);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

router.get("/getItemList/count/:company/:branch", auth, async (req, res) => {
  const { company, branch } = req.params;
  
  try {
    const count = await itemFunc.getItemCompanyBranch(company, branch);
    if (!count) return res.status(404).json(count);
    res.json(count.length);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item count" });
  }
});

router.get("/getItemInfo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const itemDetails = await itemFunc.getItemInfo(id);
    if (!itemDetails) return res.status(404).json([]);
    res.json(itemDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item details" });
  }
});

router.post("/createItem/:company/:branch/:count", authWorkerAndAdmin, async (req, res) => {
  const { company, branch, count } = req.params;
  const data = req.body.data;
  const user = req.body.user;
  try {
    const itemDetails = await itemFunc.createManyItem(
      company,
      branch,
      data,
      count
    );
    for (const itemDetail of itemDetails) {
      await logItemFunc.createLog([
        itemDetail.item_id,
        "created item",
        user.username,
        user.role,
      ]);
    }
    res.json(itemDetails);
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});

router.put("/updateItem/:id", authWorkerAndAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body.data;
  const user = req.body.user;
  try {
    const items = await itemFunc.updateItem(id, data);
    if (!items) return res.status(404).json({ message: "Item not found" });
    await logItemFunc.createLog([items, "updated Item", user.username, user.role]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});

router.put("/updateStatus", authWorkerAndAdmin, async (req, res) => {
  const { item_ids, status } = req.body;
  try {
    const updateResult = await itemFunc.updateStatus(item_ids, status);
    if (!updateResult)
      return res
        .status(404)
        .json({ message: "No items found or no updates were made" });
    await logItemFunc.createLog([
      updateResult[0],
      "updated status " +updateResult[1],
      user.username,
      user.role,
    ]);
    res.json({ message: `Items updated successfully to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating item status" });
  }
});

router.delete("/deleteItem/:id", authWorkerAndAdmin, async (req, res) => {
  const { id } = req.params;
  const user = req.body.user;
  try {
    const items = await itemFunc.deleteItem(id);
    if (!items) return res.status(404).json({ message: "Item not found" });
    await logItemFunc.createLog([items, "deleted Item", user.username, user.role]);
    res.json(items);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error deleting item" });
  }
});

module.exports = router;
