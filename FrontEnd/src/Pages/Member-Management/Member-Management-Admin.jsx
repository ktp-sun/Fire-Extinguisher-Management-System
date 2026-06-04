import SweetAlert from "sweetalert2";
import "boxicons";
import "./Member-Management.css";
import { useEffect, useRef, useState } from "react";

function Confirm() {
  SweetAlert.fire({
    title: "Are you sure?",
    text: "You need to add Member?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#FD6E28",
    cancelButtonColor: "#B3B4AD",
    confirmButtonText: "Sure",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      SweetAlert.fire({
        title: "Congratulations! ",
        text: "Member has been added!",
        icon: "success",
        confirmButtonColor: "#FD6E28",
      });
    }
  });
}

async function getBranchList(company) {
  try {
    const response = await fetch(
      `http://localhost:3000/company/getAllBranch/${company}`, {
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

async function getAllUsers() {
  try {
    const data = fetch("http://localhost:3000/users/getAllUsers", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}

const CreateUserCard = ({ setShowCreateUser, setTestUsers }) => {
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    password: "",
    role: "Member",
    client: "",
    client_access: [],
  });

  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const roleOptions = [
    "Member",
    "Super Member",
    "Worker",
    "Admin",
  ];

  // Roles that should hide company/branch inputs
  const systemRoles = ["Worker", "Admin", "Super Admin"];
  const superMemberRole = "Super Member";

  // Fetch companies on component mount (only if needed)
  useEffect(() => {
    if (systemRoles.includes(formData.role)) return;

    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await fetch(
          "http://localhost:3000/company/getAllCompany", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        // Remove duplicates and transform to array of strings
        const uniqueCompanies = [
          ...new Set(data.map((item) => item.client_id)),
        ];
        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        SweetAlert.fire({
          title: "Error!",
          text: "Failed to load companies",
          icon: "error",
          confirmButtonColor: "#FD6E28",
        });
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [formData.role]); // Add role as dependency

  // In the CreateUserCard component, update the branches useEffect hook:
  useEffect(() => {
    const fetchBranches = async () => {
      if (systemRoles.includes(formData.role) || !formData.client) {
        setBranches([]);
        return;
      }

      setLoadingBranches(true);
      try {
        const response = await getBranchList(formData.client);
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
  }, [formData.client, formData.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If role is changing to a system role, clear company and branches
    if (name === "role" && systemRoles.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        client: "",
        client_access: [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

      const response = await fetch("http://localhost:3000/users/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
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

            {/* Conditionally render company and branch inputs */}
            {!systemRoles.includes(formData.role) && (
              <>
                <label className="flex flex-col w-full" htmlFor="create-client">
                  <span className="text-sm">Company : </span>
                  <select
                    className="p-1 border-2 outline-secondary rounded hover:border-primary focus:outline-primary"
                    id="create-client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    disabled={loadingCompanies}
                  >
                    <option value="">
                      {loadingCompanies
                        ? "Loading companies..."
                        : "Select a company"}
                    </option>
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Only show branches if not Super Member */}
                {formData.role !== superMemberRole && (
                  <>
                    {loadingBranches ? (
                      <div className="text-sm text-gray-500 w-full text-center py-2">
                        Loading branches...
                      </div>
                    ) : branches.length > 0 ? (
                      <label className="flex flex-col w-full rounded">
                        <span className="text-sm">
                          Branch Assigned:{" "}
                          <b>{formData.client_access.length}</b>
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
                                checked={formData.client_access.includes(
                                  branch
                                )}
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
                    ) : formData.client ? (
                      <div className="text-sm text-gray-500 w-full text-center py-2">
                        No branches found for this company
                      </div>
                    ) : null}
                  </>
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
                  }).then(() => {
                    // Close the popup after success alert is closed
                    setShowCreateUser(false);

                    // Refresh user list
                    getAllUsers()
                      .then((response) => response.json())
                      .then((data) => {
                        setTestUsers(data);
                      });
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

const MemberManagementAdmin = () => {
  const filterBoxRef = useRef();
  const [showUserCard, setShowUserCard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [testUsers, setTestUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState({
    display_name: "",
    user: "",
    company: "",
    role: "",
    display_role: "",
    branch: [""],
  });

  useEffect(() => {
    getAllUsers()
      .then((response) => response.json())
      .then((data) => {
        setTestUsers(data);
      });
  }, []);

  function ConfirmUpdate(userName) {
    SweetAlert.fire({
      title: "Are you sure?",
      text: "You need to update " + userName + " ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FD6E28",
      cancelButtonColor: "#B3B4AD",
      confirmButtonText: "Yes",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Refresh user data after update
        const updatedUsers = await getAllUsers().then((response) =>
          response.json()
        );
        setTestUsers(updatedUsers);

        SweetAlert.fire({
          title: "Change Updated! ",
          text: "User has been updated!",
          icon: "success",
          confirmButtonColor: "#FD6E28",
        });
      }
      setShowUserCard(false);
    });
  }

  const filteredUsers = testUsers.filter((user) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "" || user.role === roleFilter;

    // Company filter
    const matchesCompany =
      companyFilter === "" || user.client === companyFilter;

    return matchesSearch && matchesRole && matchesCompany;
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

  testUsers.forEach((user, index) => {
    user.img = "https://picsum.photos/id/" + (1080 - index) + "/128/128";
  });
  const filterList = {
    Company: [...new Set(testUsers.map((user) => user.client))],
    Role: ["Member", "Super Member", "Worker", "Admin", "Super Admin"],
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

    const roleOptions = [
      "Member",
      "Super Member",
      "Worker",
      "Admin"
    ];

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
        const response = await fetch(
          `http://localhost:3000/users/updateUser/${user.username}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update user");
        }

        return true;
      } catch (error) {
        console.error("Error updating user:", error);
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
            `http://localhost:3000/users/deleteUser/${user.username}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
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
          }).then(() => {
            setShowUserCard(false);
            // Refresh user list
            getAllUsers()
              .then((response) => response.json())
              .then((data) => {
                setTestUsers(data);
              });
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          SweetAlert.fire({
            title: "Error!",
            text: "Failed to delete user",
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
              {branches.length > 0 && (
                <label className="flex flex-col w-full rounded">
                  <span className="text-sm">
                    Branch Assigned : <b>{formData.client_access.length}</b>
                  </span>
                  <div className="border-secondary border-2 hover:border-primary flex w-full p-1 rounded flex-col max-h-40 overflow-y-auto">
                    {branches.map((branch, index) => (
                      <label className="flex gap-2" key={index}>
                        <input
                          type="checkbox"
                          name={`branch_${branch}`}
                          id={`branch_${index}`}
                          checked={formData.client_access.includes(branch)}
                          onChange={(e) =>
                            handleBranchChange(branch, e.target.checked)
                          }
                        />
                        <span>{branch}</span>
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

            {/* Spacer to push other buttons to the right */}
            <div className="flex-grow"></div>

            {/* Cancel and Save buttons on the right */}
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
                  ConfirmUpdate(user.display_name);
                } else {
                  SweetAlert.fire({
                    title: "Error!",
                    text: "Failed to update user",
                    icon: "error",
                    confirmButtonColor: "#FD6E28",
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
            <button type="submit"></button>
            <h2 className="text-white">Member Management</h2>
          </div>
          <div className="Member-management-tool flex gap-2">
            <div className="Member-add flex justify-center items-center rounded">
              <button
                className="flex justify-center items-center p-2 w-fit h-fit bg-highlight"
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
                            (key === "Company" && companyFilter === item)
                          }
                          onChange={() => {
                            if (key === "Role") {
                              setRoleFilter(item);
                            } else if (key === "Company") {
                              setCompanyFilter(item);
                            }
                          }}
                        />
                        <label htmlFor={`${key.toLowerCase()}-${item}`}>
                          {item || "All"}
                        </label>
                      </div>
                    ))}
                    <button
                      className="text-sm text-gray-500 mt-1"
                      onClick={() => {
                        if (key === "Role") {
                          setRoleFilter("");
                        } else if (key === "Company") {
                          setCompanyFilter("");
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
                  <h3 className="text-black text-nowrap">
                    {user.display_name}
                  </h3>
                  <h4 className="text-dark">{user.username}</h4>
                </div>
                <div className="user-card-footer flex flex-col w-full gap-1 py-1">
                  <div className="flex items-center gap-2 justify-center ">
                    <box-icon
                      name="buildings"
                      type="regular"
                      color="#FF6700"
                    ></box-icon>
                    <span className="font-bold">{user.client || "System"}</span>
                  </div>
                  <div className="flex items-center gap-2  justify-center">
                    <box-icon
                      name="user"
                      type="regular"
                      color="#FF6700"
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

export default MemberManagementAdmin;
