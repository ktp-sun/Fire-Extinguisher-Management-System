import React, { useState, useMemo, useEffect } from "react";
import "./DataTable.css";
import CreateForm from "../CreateForm";
import "boxicons";
import ExportExcel from "../ExcelExport";
import AddItemForm from "./form/addItemForm";
import EditItemForm from "./form/editItemForm";
import QRCodeModal from "./form/QRCodeModal";

const DataTable = (props) => {
  const {
    tIcon,
    tName,
    colIcon,
    title = [],
    data = [],
    itemPerPage,
    hasButton = true,
    hasPagination = true,
    hasSearch = true,
    hasExport = false,
    hasAddItem = false,
    hasEdit = false,
    hasQr = false,
  } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false); 
  const [selectedItemId, setSelectedItemId] = useState(null);

  const itemsPerPage = itemPerPage || 10;
  const headerHeight = 32;
  const rowHeight = 40;
  const minTableHeight = rowHeight * itemsPerPage + headerHeight;

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////

  const normalizedData = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (typeof data === "object" && data !== null) return Object.values(data);
    return [];
  }, [data]);

  const isObjectData =
    typeof normalizedData[0] === "object" && !Array.isArray(normalizedData[0]);

  const totalPages = useMemo(
    () => Math.ceil(normalizedData.length / itemsPerPage),
    [normalizedData.length, itemsPerPage]
  );

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////

  const sortedData = useMemo(() => {
    const filteredData = normalizedData.filter((row) => {
      const rowValues = isObjectData ? Object.values(row) : row;
      if (searchQuery === "") {
        return true;
      }
      return rowValues.some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    return filteredData.sort((a, b) => {
      if (sortConfig.key === null) return 0;
      const itemA = isObjectData
        ? a[sortConfig.key]
        : a[title.indexOf(sortConfig.key)];
      const itemB = isObjectData
        ? b[sortConfig.key]
        : b[title.indexOf(sortConfig.key)];

      if (typeof itemA === "number" && typeof itemB === "number") {
        return sortConfig.direction === "asc" ? itemA - itemB : itemB - itemA;
      }

      return sortConfig.direction === "asc"
        ? itemA?.toString().localeCompare(itemB)
        : itemB?.toString().localeCompare(itemA);
    });
  }, [normalizedData, sortConfig, searchQuery, title, isObjectData]);

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////

  const currentData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedData, currentPage, itemsPerPage]);

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////

  const handleEditClick = (rowData) => {
    const value = isObjectData
      ? rowData
      : Object.fromEntries(title.map((key, i) => [key, rowData[i]]));
    setEditingItem({
      ...value,
      company: value.company,
      branch: value.branch,
      log: { Install: value.install_date },
    });
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleButtonClick = () => {
    setShowCreateForm(true);
  };

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  
  const handleFormSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/report/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      setShowCreateForm(false);

      const { inbox, inventory, nextCheck, lastCheck } = await fetchData(user);
      setTestActivity(inbox);
      setInventory(inventory);
      setCheckUp(nextCheck);
      setLastCheck(lastCheck);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////

  const colorIcon = (row) => {
    const value = isObjectData ? Object.values(row).join(" ") : row.join(" ");
    if (/Good|Login|Install|Report Accepted/.test(value)) return "green";
    if (/Fixing|Change/.test(value)) return "#EEE150";
    if (/Bad|Uninstall|Logout|Rejected/.test(value)) return "red";
    return "#FF6700";
  };

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////

  const getPaginationRange = () => {
    const start = Math.max(currentPage - 1, 1);
    const end = Math.min(currentPage + 1, totalPages);
    if (end - start < 2) {
      if (start === 1) return [1, 2, 3].slice(0, totalPages);
      if (end === totalPages)
        return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [start, start + 1, start + 2];
  };

  return (
    <div className="data-table-wrapper">
      <div className="table-title flex items-center justify-between flex-wrap">
        <div className="flex items-center">
          {tIcon && (
            <box-icon name={tIcon} size="sm" color="#16425b"></box-icon>
          )}
          {tName && (
            <h2 className="p-2 text-dark">
              {tName} [{data.length}]
            </h2>
          )}
        </div>
        <div className="flex gap-2 justify-center items-center">
          {hasExport && (
            <button
              className="border-2 border-primary bg-white rounded flex p-1 hover:bg-secondary"
              onClick={() => ExportExcel(data)}
            >
              <box-icon name="export" color="#FD6E28"></box-icon>
              <span className="px-1 text-primary">Export</span>
            </button>
          )}
          {hasSearch && (
            <div className="search-bar">
              <input
              className="px-2"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <box-icon
                name="search"
                type="regular"
                size="sm"
                color="#FF6700"
              ></box-icon>
            </div>
          )}
          {hasAddItem && (
            <button
              className="border-2 border-primary bg-white rounded flex p-1 hover:bg-secondary"
              onClick={() => setShowAddItemForm(true)}
            >
              <box-icon name="plus" color="#FF6700"></box-icon>
              <span className="px-1 text-primary">Add</span>
            </button>
          )}
        </div>
      </div>
      <div
        className="data-table-container overflow-scroll"
        style={{ minHeight: minTableHeight }}
      >
        <table className="data-table">
          <thead>
            <tr>
              {colIcon && <th></th>}
              {title.map((header, index) => (
                <th
                  key={index}
                  onClick={() => {
                    const isSameColumn = sortConfig.key === header;
                    setSortConfig({
                      key: header,
                      direction:
                        isSameColumn && sortConfig.direction === "asc"
                          ? "desc"
                          : "asc",
                    });
                  }}
                >
                  <span className="flex justify-center items-center text-dark">
                    {header}
                    {sortConfig.key === header && (
                      <box-icon
                        name={
                          sortConfig.direction === "asc"
                            ? "caret-up"
                            : "caret-down"
                        }
                        size="16px"
                        color="#FF6700"
                      ></box-icon>
                    )}
                  </span>
                </th>
              ))}
              {hasEdit && <th className="bg-transparent sticky -right-1"></th>}
            </tr>
          </thead>

          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    title.length +
                    (colIcon ? 1 : 0) +
                    (hasEdit ? 1 : 0) +
                    (hasQr ? 1 : 0)
                  }
                  className="text-center text-gray-500 py-4"
                >
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {colIcon && (
                    <td className="flex justify-center items-center">
                      <box-icon
                        name={colIcon}
                        size="sm"
                        color={colorIcon(row)}
                        type="regular"
                      ></box-icon>
                    </td>
                  )}
                  {title.map((key, colIndex) => (
                    <td key={colIndex} className="overflow-x-scroll max-w-xs ">
                      {isObjectData ? row[key] || "-" : row[colIndex] || "-"}
                    </td>
                  ))}
                  <td className="bg-white sticky -right-1">
                    <div className="flex justify-center items-center">
                      {hasButton && (
                        <span className="bg-white -right-2">
                          <button
                            onClick={() => {
                              setSelectedItemId(row[0]);
                              handleButtonClick();
                            }}
                            className="flex justify-center items-center"
                          >
                            <box-icon
                              type="regular"
                              name="edit"
                              size="sm"
                              color="#FD6E28"
                            ></box-icon>
                          </button>
                        </span>
                      )}
                      {hasQr && (
                        <span className="bg-white -right-1">
                          <button
                            className="flex justify-center items-center"
                            onClick={() => {
                              setSelectedItemId(row[0]);
                              setShowQRCodeModal(true);
                            }}
                          >
                            <box-icon name="qr-scan" color="#FF6700"></box-icon>
                          </button>
                        </span>
                      )}
                      {hasEdit && (
                        <span className="bg-white -right-2">
                          <button
                            onClick={() => handleEditClick(row)}
                            className="flex justify-center items-center"
                          >
                            <box-icon
                              type="regular"
                              name="edit"
                              size="sm"
                              color="#FD6E28"
                            ></box-icon>
                          </button>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showQRCodeModal && (
        <QRCodeModal
          onClose={() => setShowQRCodeModal(false)}
          id={selectedItemId}
        />
      )}
      {hasPagination && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <box-icon type="solid" name="chevrons-left"></box-icon>
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <box-icon type="solid" name="chevron-left"></box-icon>
          </button>
          {getPaginationRange().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "active" : ""}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <box-icon type="solid" name="chevron-right"></box-icon>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <box-icon type="solid" name="chevrons-right"></box-icon>
          </button>
        </div>
      )}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
          <div
            className="absolute inset-0"
            onClick={() => setShowCreateForm(false)}
          ></div>
          <CreateForm
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
            initialData={{serialNumber: selectedItemId }}
          />
        </div>
      )}
      {showAddItemForm && (
        <AddItemForm
          onClose={() => setShowAddItemForm(false)}
          onSubmit={() => setShowAddItemForm(false)}
        />
      )}
      {showEditForm && (
        <EditItemForm
          onClose={() => setShowEditForm(false)}
          onSubmit={() => setShowEditForm(false)}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

export default DataTable;
