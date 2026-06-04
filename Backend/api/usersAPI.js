// routes/users.js
const express = require("express");
const router = express.Router();
const {
  auth,
  authSuperMember,
  authWorkerAndAdmin,
  authAdmin,
} = require("./auth");
const {
  getAllUsers,
  getAllUsersCount,
  getClientUser,
  getOperatorUser,
  getWorkerUser,
  getUser,
  getUsersCount,
  createUser,
  createClientUser, // New function for Super Members
  login,
  updateUser,
  updateClientUser, // New function for Super Members
  deleteUser,
  deleteClientUser, // New function for Super Members
} = require("./users");
const activityLogFunc = require("./activityLog");
// Public routes
router.get("/me", auth, async (req, res) => {
  try {
    // The auth middleware adds the user to the request object
    const user = req.user;

    // Return user data without sensitive information
    const userResponse = {
      _id: user._id,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
      client: user.client,
      client_access: user.client_access,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
    };

    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const [status, response] = await login(username, password);
    if (status === 200) await activityLogFunc.createLog(["Log in", username, response.user.role, response.user.client]);
    res.status(status).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error processing login" });
  }
});
// Super Member, Worker, Admin, and Super Admin routes
router.get("/getClientUser/:client_id", authSuperMember, async (req, res) => {
  const { client_id } = req.params;
  try {
    // Verify Super Member can only access their own client data
    if (req.user.role === "Super Member" && req.user.client !== client_id) {
      return res
        .status(403)
        .json({ message: "Access denied to this client data" });
    }

    const data = await getClientUser(client_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

router.get("/getUsersCount/:client_id", authSuperMember, async (req, res) => {
  const { client_id } = req.params;
  try {
    if (req.user.role === "Super Member" && req.user.client !== client_id) {
      return res
        .status(403)
        .json({ message: "Access denied to this client data" });
    }

    const count = await getUsersCount(client_id);
    res.json(count);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user count" });
  }
});

router.post("/createClientUser", authSuperMember, async (req, res) => {
  try {
    const authUser = req.user;
    const userData = req.body;
    const newUser = await createClientUser(authUser, userData);
    res.status(201).json(newUser);
  } catch (error) {
    handleUserError(res, error);
  }
});

router.put("/updateClientUser/:username", authSuperMember, async (req, res) => {
  try {
    const authUser = req.user;
    const { username } = req.params;
    const updatedUser = await updateClientUser(authUser, username, req.body);
    res.json(updatedUser);
  } catch (error) {
    handleUserError(res, error);
  }
});

router.delete("/deleteClientUser/:username", authSuperMember, async (req, res) => {
  try {
    const authUser = req.user;
    const { username } = req.params;
    const result = await deleteClientUser(authUser, username);
    res.json(result);
  } catch (error) {
    handleUserError(res, error);
  }
});

// Worker and Admin routes
router.get("/getWorkerUser", authWorkerAndAdmin, async (req, res) => {
  try {
    const data = await getWorkerUser();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

// Admin only routes
router.get("/getAllUsers", authAdmin, async (req, res) => {
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

router.get("/getOperatorUser", authAdmin, async (req, res) => {
  try {
    const data = await getOperatorUser();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

router.get("/getAllUsersCount", authAdmin, async (req, res) => {
  try {
    const count = await getAllUsersCount();
    res.json(count);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user count" });
  }
});

router.get("/getUser/:username", authAdmin, async (req, res) => {
  const { username } = req.params;
  try {
    const data = await getUser(username);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

router.post("/createUser", async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    handleUserError(res, error);
  }
});

router.put("/updateUser/:username", authAdmin, async (req, res) => {
  const { username } = req.params;
  try {
    const updatedUser = await updateUser(username, req.body);
    res.json(updatedUser);
  } catch (error) {
    handleUserError(res, error);
  }
});

router.delete("/deleteUser/:username", authAdmin, async (req, res) => {
  const { username } = req.params;
  try {
    const data = await deleteUser(username);
    res.json(data);
  } catch (error) {
    handleUserError(res, error);
  }
});

// Helper function for error handling
function handleUserError(res, error) {
  console.error("User operation error:", error);
  if (error.message === "Missing required fields") {
    res.status(400).json({ message: error.message });
  } else if (error.message === "Username already exists") {
    res.status(409).json({ message: error.message });
  } else if (error.message === "Cannot modify this user type") {
    res.status(403).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Error processing user operation" });
  }
}

module.exports = router;
