import React, { useEffect, useState } from "react";
import useAnimatedNumber from "../useAnimatedNumber";
import "./Status.css";
import "boxicons";

const Status = ({ role, company, branch }) => {
  const [MemberItemCount, setMemberItemCount] = useState(0);
  const animatedMemberItemCount = useAnimatedNumber(MemberItemCount);
  
  const [MemberReportPendingCount, setMemberReportPendingCount] = useState(0);
  const animatedMemberReportPendingCount = useAnimatedNumber(MemberReportPendingCount);
  
  const [MemberBadItemCount, setMemberBadItemCount] = useState(0);
  const animatedMemberBadItemCount = useAnimatedNumber(MemberBadItemCount);

  const [MemberNextCheck, setMemberNextCheck] = useState("");

  const [superMemberItemCount, setSuperMemberItemCount] = useState(0);
  const animatedSuperMemberItemCount = useAnimatedNumber(superMemberItemCount);
  
  const [superMemberReportPendingCount, setSuperMemberReportPendingCount] = useState(0);
  const animatedSuperMemberReportPendingCount = useAnimatedNumber(superMemberReportPendingCount);
  
  const [superMemberBadItemCount, setSuperMemberBadItemCount] = useState(0);
  const animatedSuperMemberBadItemCount = useAnimatedNumber(superMemberBadItemCount);
  
  const [superMemberTotalUser, setSuperMemberTotalUser] = useState(0);
  const animatedSuperMemberTotalUser = useAnimatedNumber(superMemberTotalUser);
  
  const [superMemberTotalBranch, setSuperMemberTotalBranch] = useState(0);
  const animatedSuperMemberTotalBranch = useAnimatedNumber(superMemberTotalBranch);
  
  const [AdminItemCount, setAdminItemCount] = useState(0);
  const animatedAdminItemCount = useAnimatedNumber(AdminItemCount);
  
  const [AdminReportPendingCount, setAdminReportPendingCount] = useState(0);
  const animatedAdminReportPendingCount = useAnimatedNumber(AdminReportPendingCount);
  
  const [AdminBadItemCount, setAdminBadItemCount] = useState(0);
  const animatedAdminBadItemCount = useAnimatedNumber(AdminBadItemCount);
  
  const [AdminTotalUser, AdminSetTotalUser] = useState(0);
  const animatedAdminTotalUser = useAnimatedNumber(AdminTotalUser);

  

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "Member" && branch !== "All Branches") {
          const itemInBranchCount = await fetch(`http://localhost:3000/item/getItemList/count/${company}/${branch}`, authHeaders);
          setMemberItemCount(parseInt(await itemInBranchCount.text()));

          const reportPendingCount = await fetch(`http://localhost:3000/report/getReportStatusByBranch/count/${company}/${branch}/pending`, authHeaders);
          setMemberReportPendingCount(parseInt(await reportPendingCount.text()));

          const badItemCount = await fetch(`http://localhost:3000/report/getReportStatusByBranch/count/${company}/${branch}/accepted`, authHeaders);
          setMemberBadItemCount(parseInt(await badItemCount.text()));

          const nextCheck = await fetch(`http://localhost:3000/company/getNextCheck/${company}/${branch}`, authHeaders);
          setMemberNextCheck((await nextCheck.text()).replace(/"/g, ""));
        }

        else if (role === "Super Member") {

          const itemInBranchCount = await fetch(`http://localhost:3000/item/getItemList/count/${company}`, authHeaders);
          setSuperMemberItemCount(parseInt(await itemInBranchCount.text()));

          const reportPendingURL = branch !== "All Branches"
            ? `http://localhost:3000/report/getReportStatusByBranch/count/${company}/${branch}/pending`
            : `http://localhost:3000/report/getReportStatusByCom/count/${company}/pending`;
          const reportPending = await fetch(reportPendingURL, authHeaders);
          setSuperMemberReportPendingCount(parseInt(await reportPending.text()));

          const badItemURL = branch !== "All Branches"
            ? `http://localhost:3000/report/getReportStatusByBranch/count/${company}/${branch}/accepted`
            : `http://localhost:3000/report/getReportStatusByCom/count/${company}/accepted`;
          const badItem = await fetch(badItemURL, authHeaders);
          setSuperMemberBadItemCount(parseInt(await badItem.text()));

          const totalUser = await fetch(`http://localhost:3000/users/getUsersCount/${company}`, authHeaders);
          setSuperMemberTotalUser(parseInt(await totalUser.text()));

          const branches = await fetch(`http://localhost:3000/company/getAllBranch/${company}`, authHeaders);
          setSuperMemberTotalBranch((await branches.json()).length);
        }

        else if (role === "Admin") {
          const itemCount = await fetch(`http://localhost:3000/item/getAllItem/count`, authHeaders);
          setAdminItemCount(parseInt(await itemCount.text()));

          const reportCount = await fetch(`http://localhost:3000/report/getAllReportByStatus/count/pending`, authHeaders);
          setAdminReportPendingCount(parseInt(await reportCount.text()));

          const badItemCount = await fetch(`http://localhost:3000/report/getAllReportByStatus/count/accepted`, authHeaders);
          setAdminBadItemCount(parseInt(await badItemCount.text()));

          const totalUsers = await fetch(`http://localhost:3000/users/getAllUsers`, authHeaders);
          AdminSetTotalUser((await totalUsers.json()).length);
        }
      } catch (error) {
        console.error("Fetch error in Status component:", error);
      }
    };

    fetchData();
  }, [role, company, branch]);

  if (role === "Member") {
    return (
      <div className="status-container flex w-full justify-between">
        <div className="flex justify-between items-center status-box bg-primary ">
          <div className="count-title p-1 m-1">
            <h3>Installed</h3>
            <h1>{animatedMemberItemCount}</h1>
          </div>
          <box-icon name="spray-can" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Report Sent</h3>
            <h1>{animatedMemberReportPendingCount}</h1>
          </div>
          <box-icon name="send" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">
          <div className="count-title p-1 m-1">
            <h3>Need Action</h3>
            <h1>{animatedMemberBadItemCount}</h1>
          </div>
          <box-icon name="wrench" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Next Check</h3>
            <h1>{MemberNextCheck || "N/A"}</h1>
          </div>
          <box-icon name="calendar" color="white" size="lg"></box-icon>
        </div>
      </div>
    );
  }

  if (role === "Super Member") {
    return (
      <div className="status-container flex w-full justify-between">
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Total Item</h3>
            <h1>{animatedSuperMemberItemCount}</h1>
          </div>
          <box-icon name="spray-can" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">
          <div className="count-title p-1 m-1">
            <h3>Member</h3>
            <h1>{animatedSuperMemberTotalUser}</h1>
          </div>
          <box-icon name="user" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Branch</h3>
            <h1>{animatedSuperMemberTotalBranch}</h1>
          </div>
          <box-icon name="git-branch" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">  
          <div className="count-title p-1 m-1"> 
            <h3>Report Sent</h3>
            <h1>{animatedSuperMemberReportPendingCount}</h1>
          </div>
          <box-icon name="send" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Need Action</h3>
            <h1>{animatedSuperMemberBadItemCount}</h1>
          </div>
          <box-icon name="wrench" color="white" size="lg"></box-icon>
        </div>
      </div>
    );
  }

  if (role === "Admin") {
    return (
      <div className="status-container flex w-full justify-between">
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Total Installed</h3>
            <h1>{animatedAdminItemCount}</h1>
          </div>
          <box-icon name="spray-can" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">
          <div className="count-title p-1 m-1">
            <h3>Total Report</h3>
            <h1>{animatedAdminReportPendingCount}</h1>
          </div>
          <box-icon name="news" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Need Action</h3>
            <h1>{animatedAdminBadItemCount}</h1>
          </div>  
          <box-icon name="wrench" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">
          <div className="count-title p-1 m-1">
            <h3>Total User</h3>
            <h1>{animatedAdminTotalUser}</h1>
          </div>
          <box-icon name="user" color="white" size="lg"></box-icon>
        </div>
      </div>
    );
  }

  if (role === "Super Admin") {
    return (
      <div className="status-container flex w-full justify-between">
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Total Installed</h3>
            <h1>{getAllItemCompanyCount()}</h1>
          </div>
          <box-icon name="spray-can" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">
          <div className="count-title p-1 m-1">
            <h3>Total Client</h3>
            <h1>{getCompanyCount()}</h1>
          </div>
          <box-icon name="buildings" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-primary">
          <div className="count-title p-1 m-1">
            <h3>Total User</h3>
            <h1>{getAllUserCount()}</h1>
          </div>
          <box-icon name="user" color="white" size="lg"></box-icon>
        </div>
        <div className="flex justify-between items-center status-box bg-secondary">
          <div className="count-title p-1 m-1">
            <h3>Total Actions</h3>
            <h1>{getAllLogReportPendingCount()}</h1>
          </div>  
          <box-icon name="wrench" color="white" size="lg"></box-icon>
        </div>
      </div>
    );
  }

  return null;
};

export default Status;
