import { useRef, useState, useEffect } from "react";
import SweetAlert from "sweetalert2";
import "boxicons";
import "./Member-Management.css";
import { useAuth } from "../../Auth/AuthProvider";

async function getAllUsers(company) {
  try {
    const response = await fetch(
      `http://localhost:3000/users/getClientUser/${company}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function getBranchList(company) {
  try {
    const response = await fetch(
      `http://localhost:3000/company/getAllBranch/${company}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

const CreateUserCard = ({ setShowCreateUser, setTestUsers, company }) => {
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    password: "",
    role: "Member",
    client: company,
    client_access: [],
  });

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const roleOptions = ["Member", "Super Member"];

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await getBranchList(company);
        const branchNames = response.map((branch) => branch.client_branch_id);
        setBranches(branchNames);
      } catch (error) {
        console.error("Error fetching branches:", error);
        SweetAlert.fire({
          title: "Error!",
          text: "Failed to load branches",
          icon: "error",
          confirmButtonColor: "#FD6E28",
        });
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchChange = (branch, isChecked) => {
    setFormData((prev) => {
      const newAccess = isChecked
        ? [...prev.client_access, branch]
        : prev.client_access.filter((b) => b !== branch);
      return { ...prev, client_access: newAccess };
    });
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.display_name || !formData.username || !formData.password) {
        SweetAlert.fire({
          title: "Error!",
          text: "Please fill in all required fields",
          icon: "error",
          confirmButtonColor: "#FD6E28",
        });
        return false;
      }

      // For Super Members, set client_access to all branches
      const submitData = { ...formData };
      if (submitData.role === "Super Member") {
        submitData.client_access = branches;
      }

      const response = await fetch("http://localhost:3000/users/createClientUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      SweetAlert.fire({
        title: "Error!",
        text: error.message || "Error creating user",
        icon: "error",
        confirmButtonColor: "#FD6E28",
      });
      return false;
    }
  };

  return (
    <div className="w-fit h-fit">
      <div
        className="rounded-lg user-card-edit flex flex-col justify-center items-center
        bg-white flex-1 drop-shadow-lg gap-2 p-4 w-[400px] h-fit border-2 border-secondary"
      >
        <div className="user-card-detail flex flex-col w-full h-full gap-2">
          <div className="user-card-header flex flex-col justify-center items-center">
            <h2 className="text-secondary">Create New User</h2>
            <div className="user-card-img flex justify-center items-center">
              <img
                className="w-48 h-48 rounded-full p-1 border-primary border-2 transition-all duration-300 ease-in-out hover:border-8 hover:p-0"
                src="https://picsum.photos/id/1/128/128"
                alt="default user"
              />
            </div>
          </div>
          <div className="user-card-body flex flex-col justify-center items-start gap-2">
            <label
              className="flex flex-col w-full"
              htmlFor="create-display-name"
            >
              <span className="text-sm">
                Full Name : <span className="text-red-500">*</span>
              </span>
              <input
                className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary"
                type="text"
                id="create-display-name"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="flex flex-col w-full" htmlFor="create-username">
              <span className="text-sm">
                Username : <span className="text-red-500">*</span>
              </span>
              <input
                className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary"
                type="text"
                id="create-username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="flex flex-col w-full" htmlFor="create-password">
              <span className="text-sm">
                Password : <span className="text-red-500">*</span>
              </span>
              <input
                className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary"
                type="password"
                id="create-password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="flex flex-col w-full" htmlFor="create-role">
              <span className="text-sm">
                Role : <span className="text-red-500">*</span>
              </span>
              <select
                className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary w-full"
                id="create-role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            {formData.role === "Member" && (
              <>
                {loadingBranches ? (
                  <div className="text-sm text-gray-500 w-full text-center py-2">
                    Loading branches...
                  </div>
                ) : branches.length > 0 ? (
                  <label className="flex flex-col w-full rounded">
                    <span className="text-sm">
                      Branch Assigned: <b>{formData.client_access.length}</b>
                    </span>
                    <div className="border-secondary border-2 hover:border-primary flex w-full p-1 rounded flex-col max-h-40 overflow-y-auto">
                      {branches.map(
                        (
                          branch,
                          index // Changed from formData.client_access to branches
                        ) => (
                          <label
                            className="flex gap-2 items-center p-1 hover:bg-gray-100 rounded"
                            key={index}
                          >
                            <input
                              type="checkbox"
                              name={`branch_${branch}`}
                              id={`branch_${index}`}
                              checked={formData.client_access.includes(branch)}
                              onChange={(e) =>
                                handleBranchChange(branch, e.target.checked)
                              }
                              className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                            />
                            <span className="text-sm">{branch}</span>
                          </label>
                        )
                      )}
                    </div>
                  </label>
                ) : (
                  <div className="text-sm text-gray-500 w-full text-center py-2">
                    No branches found for this company
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex w-full gap-2">
          <button
            className="bg-red-600 flex w-full justify-center items-center text-white p-1 rounded-lg"
            onClick={() => setShowCreateUser(false)}
          >
            <box-icon name="x" color="white"></box-icon>
            Cancel
          </button>
          <button
            className="bg-green-600 flex w-full justify-center items-center text-white p-1 rounded-lg"
            onClick={async () => {
              const result = await SweetAlert.fire({
                title: "Are you sure?",
                text: "You are about to create a new user",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#FD6E28",
                cancelButtonColor: "#B3B4AD",
                confirmButtonText: "Create User",
                reverseButtons: true,
              });

              if (result.isConfirmed) {
                const success = await handleSubmit();
                if (success) {
                  SweetAlert.fire({
                    title: "Success!",
                    text: "User created successfully",
                    icon: "success",
                    confirmButtonColor: "#FD6E28",
                  }).then(async () => {
                    setShowCreateUser(false);
                    try {
                      const users = await getAllUsers(company); // Make sure to pass company here
                      setTestUsers(users);
                    } catch (error) {
                      console.error("Error fetching users:", error);
                    }
                  });
                }
              }
            }}
          >
            <box-icon name="user-plus" color="white"></box-icon>
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

const MemberManagementSuperMember = () => {
  const { user } = useAuth();
  const filterBoxRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserCard, setShowUserCard] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState({
    display_name: "",
    username: "",
    client: "",
    role: "",
    client_access: [],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers(user.client);

        setTestUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user.client]);

  function refreshUsers() {
    getAllUsers(user.client).then((response) => {
      setTestUsers(response);
    });
  }

  testUsers.forEach((user, index) => {
    user.img = "https://picsum.photos/id/" + (1080 - index) + "/128/128";
  });

  const filteredUsers = testUsers.filter((user) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "" || user.role === roleFilter;

    // Branch filter
    const matchesBranch =
      branchFilter === "" || user.client_access.includes(branchFilter);

    return matchesSearch && matchesRole && matchesBranch;
  });

  const itemsPerPage = 8;

  const currentData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const getPaginationRange = () => {
    const start = Math.max(currentPage - 1, 1);
    const end = Math.min(currentPage + 1, totalPages);
    if (end - start < 2) {
      if (start === 1) {
        return [1, 2, 3].slice(0, totalPages);
      } else if (end === totalPages) {
        return [totalPages - 2, totalPages - 1, totalPages];
      }
    }

    return [start, start + 1, start + 2];
  };

  const toggleFilterBox = () => {
    filterBoxRef.current.classList.toggle("hidden");
  };

  const handleUserCard = (user) => {
    setShowUserCard(true);
    setSelectedUser(user);
  };

  const UserCardEdit = ({ user }) => {
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
      display_name: user.display_name,
      username: user.username,
      role: user.role,
      client_access: [...user.client_access],
    });

    const roleOptions = ["Member", "Super Member"];

    useEffect(() => {
      const fetchBranches = async () => {
        try {
          const response = await getBranchList(user.client);
          const branchNames = response.map((branch) => branch.client_branch_id);
          setBranches(branchNames);
        } catch (error) {
          console.error("Error fetching branches:", error);
        }
      };

      fetchBranches();
    }, [user.client]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBranchChange = (branch, isChecked) => {
      setFormData((prev) => {
        const newAccess = isChecked
          ? [...prev.client_access, branch]
          : prev.client_access.filter((b) => b !== branch);
        return { ...prev, client_access: newAccess };
      });
    };

    const handleSubmit = async () => {
      try {
        // For Super Members, set client_access to all branches
        const submitData = { ...formData };
        if (submitData.role === "Super Member") {
          submitData.client_access = branches;
        }

        const response = await fetch(
          `http://localhost:3000/users/updateClientUser/${user.username}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submitData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update user");
        }

        const updatedUser = await response.json();

        // Update the testUsers state with the updated user
        setTestUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.username === updatedUser.username ? updatedUser : u
          )
        );

        return true;
      } catch (error) {
        console.error("Error updating user:", error);
        SweetAlert.fire({
          title: "Error!",
          text: error.message || "Failed to update user",
          icon: "error",
          confirmButtonColor: "#FD6E28",
        });
        return false;
      }
    };

    const handleDelete = async () => {
      const result = await SweetAlert.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FD6E28",
        cancelButtonColor: "#B3B4AD",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true,
      });
    
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:3000/users/deleteClientUser/${user.username}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              method: "DELETE",
            }
          );
    
          if (!response.ok) {
            throw new Error("Failed to delete user");
          }
    
          SweetAlert.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
            confirmButtonColor: "#FD6E28",
          }).then(async () => {
            setShowUserCard(false);
            try {
              refreshUsers();
            } catch (error) {
              console.error("Error fetching users after deletion:", error);
              // Optionally show error to user
              SweetAlert.fire({
                title: "Error!",
                text: "User deleted but couldn't refresh list",
                icon: "warning",
                confirmButtonColor: "#FD6E28",
              });
            }
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          SweetAlert.fire({
            title: "Error!",
            text: error.message || "Failed to delete user",
            icon: "error",
            confirmButtonColor: "#FD6E28",
          });
        }
      }
    };

    return (
      <div className="w-fit h-fit">
        <div
          className="rounded-lg user-card-edit flex flex-col justify-center items-center
          bg-white flex-1 drop-shadow-lg gap-2 p-4 w-[400px] h-fit border-2 border-secondary"
        >
          <div className="user-card-detail flex flex-col w-full h-full gap-2">
            <div className="user-card-header flex flex-col justify-center items-center">
              <h2 className="text-secondary">Update Member Details</h2>
              <div className="user-card-img flex justify-center items-center">
                <img
                  className="w-48 h-48 rounded-full p-1 border-primary border-2 transition-all duration-300 ease-in-out hover:border-8 hover:p-0"
                  src={user.img}
                  alt="user"
                />
              </div>
            </div>
            <div className="user-card-body flex flex-col justify-center items-start gap-2">
              <label
                className="flex flex-col w-full"
                htmlFor="user-display-name"
              >
                <span className="text-sm">Full Name : </span>
                <input
                  className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary"
                  type="text"
                  id="user-display-name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col w-full" htmlFor="user-username">
                <span className="text-sm">Username : </span>
                <input
                  className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary"
                  type="text"
                  id="user-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled
                />
              </label>
              <label className="flex flex-col w-full" htmlFor="user-role">
                <span className="text-sm">Role : </span>
                <select
                  className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary w-full"
                  id="user-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              {formData.role === "Member" && (
                <label className="flex flex-col w-full rounded">
                  <span className="text-sm">
                    Branch Assigned : <b>{formData.client_access.length}</b>
                  </span>
                  <div className="border-secondary border-2 hover:border-primary flex w-full p-1 rounded flex-col max-h-40 overflow-y-auto">
                    {branches.map((branch, index) => (
                      <label
                        className="flex gap-2 items-center p-1 hover:bg-gray-100 rounded"
                        key={index}
                      >
                        <input
                          type="checkbox"
                          name={`branch_${branch}`}
                          id={`branch_${index}`}
                          checked={formData.client_access.includes(branch)}
                          onChange={(e) =>
                            handleBranchChange(branch, e.target.checked)
                          }
                          className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                        />
                        <span className="text-sm">{branch}</span>
                      </label>
                    ))}
                  </div>
                </label>
              )}
            </div>
          </div>
          <div className="flex w-full gap-2">
            <button
              className="bg-red-600 flex justify-center items-center text-white p-2 rounded-lg"
              onClick={handleDelete}
            >
              <box-icon name="trash" color="white"></box-icon>
            </button>
            <div className="flex-grow"></div>
            <button
              className="bg-red-600 flex justify-center items-center text-white p-2 rounded-lg"
              onClick={() => setShowUserCard(false)}
            >
              <box-icon name="x" color="white"></box-icon>
            </button>
            <button
              className="bg-green-600 flex justify-center items-center text-white p-2 rounded-lg"
              onClick={async () => {
                const success = await handleSubmit();
                if (success) {
                  SweetAlert.fire({
                    title: "Success!",
                    text: "User updated successfully",
                    icon: "success",
                    confirmButtonColor: "#FD6E28",
                  }).then(() => {
                    setShowUserCard(false);
                  });
                }
              }}
            >
              <box-icon name="check" color="white"></box-icon>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get unique branches for filter
  const allBranches = [];
  testUsers.forEach((user) => {
    user.client_access.forEach((branch) => {
      if (!allBranches.includes(branch)) {
        allBranches.push(branch);
      }
    });
  });

  const filterList = {
    Branch: allBranches,
    Role: ["Member", "Super Member"],
  };

  return (
    <div>
      {showUserCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
          <div
            className="absolute inset-0"
            onClick={() => setShowUserCard(false)}
          ></div>
          <UserCardEdit user={selectedUser} />
        </div>
      )}

      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
          <div
            className="absolute inset-0"
            onClick={() => setShowCreateUser(false)}
          ></div>
          <CreateUserCard
            setShowCreateUser={setShowCreateUser}
            setTestUsers={setTestUsers}
            company={user.client}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="Member-management-bar bg-primary p-2 rounded-[8px] drop-shadow flex items-center justify-between sticky top-0 z-10">
          <div className="Member-management-header flex gap-2 justify-center items-center">
            <box-icon
              name="group"
              type="solid"
              size="md"
              color="white"
            ></box-icon>
            <h2 className="text-white">Member Management</h2>
          </div>
          <div className="Member-management-tool flex gap-2">
            <div className="Member-add flex justify-center items-center rounded">
              <button
                className="flex justify-center items-center p-2 w-fit h-fit bg-primary"
                name="add-user"
                onClick={() => setShowCreateUser(true)}
              >
                <box-icon
                  name="user-plus"
                  type="solid"
                  size="sm"
                  color="white"
                ></box-icon>
              </button>
            </div>
            <div className="Member-search flex flex-col justify-center items-center gap-2">
              <div className="search-box flex gap-2">
                <button
                  className="flex justify-center items-center w-fit h-fit"
                  onClick={toggleFilterBox}
                >
                  <box-icon
                    name="filter"
                    type="regular"
                    size="sm"
                    color="#F4A261"
                  ></box-icon>
                </button>
                <input
                  type="text"
                  placeholder="Search by name or username"
                  name="Member-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="flex justify-center items-center w-fit h-fit">
                  <box-icon
                    name="search"
                    type="regular"
                    size="sm"
                    color="#F4A261"
                  ></box-icon>
                </button>
              </div>
              <div className="filter-box hidden" ref={filterBoxRef}>
                {Object.keys(filterList).map((key) => (
                  <div className="filter-item flex flex-col" key={key}>
                    <h4 className="text-white w-full text-center bg-primary rounded-[4px]">
                      {key}
                    </h4>
                    {filterList[key].map((item) => (
                      <div className="filter-list" key={item}>
                        <input
                          type="radio"
                          name={key.toLowerCase()}
                          id={`${key.toLowerCase()}-${item}`}
                          checked={
                            (key === "Role" && roleFilter === item) ||
                            (key === "Branch" && branchFilter === item)
                          }
                          onChange={() => {
                            if (key === "Role") {
                              setRoleFilter(item);
                            } else if (key === "Branch") {
                              setBranchFilter(item);
                            }
                          }}
                        />
                        <label htmlFor={`${key.toLowerCase()}-${item}`}>
                          {item}
                        </label>
                      </div>
                    ))}
                    <button
                      className="text-sm text-gray-500 mt-1"
                      onClick={() => {
                        if (key === "Role") {
                          setRoleFilter("");
                        } else if (key === "Branch") {
                          setBranchFilter("");
                        }
                      }}
                    >
                      Clear {key} filter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="user-card-container grid grid-cols-4 gap-2 p-1">
          {currentData.map((user, index) => (
            <div
              className="user-card flex flex-col items-center flex-1 bg-white drop-shadow-md"
              key={index}
            >
              <div className="user-card-detail flex flex-col w-full h-full">
                <div className="user-card-header flex flex-col justify-center items-center">
                  <div className="user-card-img flex justify-center items-center">
                    <img
                      className="w-32 h-32 rounded-full"
                      src={user.img}
                      alt="user-profile-img"
                    />
                  </div>
                </div>
                <div className="user-card-body flex flex-col justify-center items-center">
                  <h3 className="text-primary text-nowrap">
                    {user.display_name}
                  </h3>
                  <h4>{user.username}</h4>
                </div>
                <div className="user-card-footer flex flex-col w-full gap-1 py-1">
                  <div className="flex items-center gap-2 justify-center ">
                    <box-icon
                      name="buildings"
                      type="regular"
                      color="#DF7A61"
                    ></box-icon>
                    <span className="font-bold">{user.client || "System"}</span>
                  </div>
                  <div className="flex items-center gap-2  justify-center">
                    <box-icon
                      name="user"
                      type="regular"
                      color="#DF7A61"
                    ></box-icon>{" "}
                    <span>{user.role}</span>
                  </div>
                </div>
              </div>
              <button
                className="edit-button flex w-full justify-center items-center w-ful text-white p-1 rounded-lg"
                onClick={() => handleUserCard(user)}
              >
                <box-icon name="edit-alt" color="white"></box-icon>
                Edit User
              </button>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center">
            <div className="pagination bg-white drop-shadow-sm p-1 rounded-lg w-full">
              <button
                onClick={() => changePage(1)}
                disabled={currentPage === 1}
              >
                <box-icon type="solid" name="chevrons-left"></box-icon>
              </button>
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <box-icon type="solid" name="chevron-left"></box-icon>
              </button>
              {getPaginationRange().map((page) => (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={currentPage === page ? "active" : ""}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <box-icon type="solid" name="chevron-right"></box-icon>
              </button>
              <button
                onClick={() => changePage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <box-icon type="solid" name="chevrons-right"></box-icon>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagementSuperMember;
