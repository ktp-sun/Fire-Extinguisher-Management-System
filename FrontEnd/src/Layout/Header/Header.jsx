import React, { useEffect, useState } from "react";
import "./Header.css";
import { useAuth } from "../../Auth/AuthProvider";
import axios from "axios";

const Header = () => {
  const [allBranches, setAllBranches] = useState([]);
  const { user, updateSelectedBranch } = useAuth();

  const handleBranchChange = (event) => {
    const selectedBranch = event.target.value;
    
    if (user.role === "Super Member") {
      if (selectedBranch === "All Branches") {
        updateSelectedBranch("All Branches", "Super Member");
      } else {
        updateSelectedBranch(selectedBranch, "Member");
      }
    } else {
      updateSelectedBranch(selectedBranch);
    }
  };

  useEffect(() => {
    if (user.role === "Super Member") {
      const fetchBranches = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/company/getAllBranch/${user.client}`,{
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            }
          );
          // Extract branch IDs from response and add "All Branches" option
          const branches = response.data.map(item => item.client_branch_id);
          setAllBranches(["All Branches", ...branches]);
        } catch (error) {
          console.error("Error fetching branches:", error);
          setAllBranches(["All Branches", ...user.client_access]);
        }
      };
      fetchBranches();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="header flex justify-between items-center">
      <div className="header-text flex flex-col justify-center h-28">
        {user.client && (
          <p className="ml-2">
            Hi {user.display_name} from {user.client}
          </p>
        )}
        <span className="ml-2 text-4xl">
          Welcome to <span className="text-highlight font-bold">FEMS</span>!
        </span>
      </div>
      {(user.role === "Member" || user.role === "Super Member") && (
        <div className="branch-selector-container flex justify-between items-center gap-2 drop-shadow-md w-[250px]">
          <box-icon name="buildings" type="regular" color="white"></box-icon>
          <div className="branch-selector w-full">
            <select
              name="branch-selector"
              id="branch-selector"
              className="border-2 border-primary p-1 px-2 rounded w-full"
              onChange={handleBranchChange}
              value={user.selectedBranch || ''}
            >
              {user.role === "Super Member" ? (
                allBranches.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))
              ) : (
                user.client_access.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;