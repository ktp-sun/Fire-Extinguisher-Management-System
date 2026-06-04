import { useState } from "react";
import PropTypes from "prop-types";
import SweetAlert from "sweetalert2";
import "boxicons";
import "./CreateForm.css";
import { useAuth } from "../Auth/AuthProvider";

const commonProblems = [
  "Fire extinguisher expired",
  "Pressure gauge damaged",
  "Hose torn or damaged",
  "Nozzle clogged",
  "Tank swollen or rusted",
  "Sticker or label fallen off",
  "Mounting bracket damaged"
];

async function sendReport(data, user) {
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (user) {
      formData.append("user", JSON.stringify(user));
    }
    if (data.image) {
      formData.append("image", data.image);
    }

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    const res = await fetch(
      `http://localhost:3000/report/createReport/${data.serialNumber}`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error sending report:", err);
    throw err;
  }
}

function CreateForm({ onClose, initialData }) {
  const { user } = useAuth();
  const [forms, setForms] = useState([
    {
      id: 1,
      serialNumber: initialData?.serialNumber || "",
      problem: "",
      selectedProblems: [],
      image: null,
      isCollapsed: false,
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  //...
  const [uploadedImage, setUploadedImage] = useState(null); // state สำหรับเก็บรูปที่อัปโหลด

  // ฟังก์ชันเดิมทั้งหมดคงเดิม
  const handleChange = (id, e) => {
    const { name, value } = e.target;
    setForms(forms.map((f) => (f.id === id ? { ...f, [name]: value } : f)));
  };

  const handleSelectProblem = (id, problem) => {
    setForms(forms.map((form) => {
      if (form.id !== id) return form;

      let updatedProblem = form.problem;
      let updatedSelected = [...form.selectedProblems];

      // ถ้าปัญหานี้ถูกเลือกอยู่แล้ว
      if (form.selectedProblems.includes(problem)) {
        // ลบออกจากรายการที่เลือก
        updatedSelected = form.selectedProblems.filter(p => p !== problem);
        // ลบออกจากช่องข้อความ
        updatedProblem = form.problem
          .split(', ')
          .filter(p => p.trim() !== problem)
          .join(', ');
      }
      // ถ้ายังไม่ถูกเลือก
      else {
        updatedSelected = [...form.selectedProblems, problem];
        // เพิ่มเข้าไปในช่องข้อความ
        updatedProblem = form.problem
          ? `${form.problem}, ${problem}`
          : problem;
      }

      return {
        ...form,
        problem: updatedProblem,
        selectedProblems: updatedSelected
      };
    }));
  };

  const addNewForm = () => {
    const newId = forms.length ? Math.max(...forms.map((f) => f.id)) + 1 : 1;
    setForms([
      ...forms,
      {
        id: newId,
        serialNumber: "", // ฟอร์มใหม่เริ่มต้นที่ว่าง
        problem: "",
        selectedProblems: [],
        image: null, // เพิ่มส่วนของรูปภาพ
        isCollapsed: false,
      },
    ]);
  };

  const toggleCollapse = (id) => {
    setForms(
      forms.map((f) =>
        f.id === id ? { ...f, isCollapsed: !f.isCollapsed } : f
      )
    );
  };

  const removeForm = (id) => {
    if (forms.length === 1) {
      SweetAlert.fire({
        title: "Cannot remove",
        text: "You must have at least one report",
        icon: "warning",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    SweetAlert.fire({
      title: "Are you sure?",
      text: "You want to remove this report?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Remove",
    }).then((result) => {
      if (result.isConfirmed) {
        setForms(forms.filter((f) => f.id !== id));
      }
    });
  };

  const confirmSend = async () => {
    //...
    const emptyFields = forms.some(
      (form) => !form.serialNumber || !form.problem.trim()
    );

    if (emptyFields) {
      SweetAlert.fire({
        title: "Incomplete Forms",
        text: "Please enter problem description before submitting",
        icon: "warning",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    const isGuest = !user;

    const result = await SweetAlert.fire({
      title: "Are you sure?",
      text: `You want to send ${forms.length} report${forms.length > 1 ? "s" : ""
        }${isGuest ? ' as Guest' : ''}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Send ${forms.length} Report${forms.length > 1 ? "s" : ""
        }`,
    });

    if (result.isConfirmed) {
      setIsSending(true);
      try {
        const results = [];
        for (const form of forms) {
          results.push(
            await sendReport({
              serialNumber: form.serialNumber,
              problem: form.problem,
              user: user || "Guest",
              image: form.image,
            }, user)
          );
        }

        //...
        SweetAlert.fire({
          title: "Success!",
          text: `Your ${forms.length} report${forms.length > 1 ? "s were" : " was"
            } sent successfully${isGuest ? ' as Guest' : ''}`,
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });

        setForms([
          {
            id: 1,
            serialNumber: initialData?.serialNumber || "",
            problem: "",
            selectedProblems: [],
            isCollapsed: false,
          },
        ]);
        onClose();
      } catch (error) {
        //...
        let errorMessage = "Failed to send reports. Please try again.";
        let title = "Error"
        let icon = "error"
        if (error.message.includes("Network Error")) {
          errorMessage =
            "Network error. Please check your internet connection.";
        } else if (error.message.includes("401") && !isGuest) {
          errorMessage = "Session expired. Please login again.";
        } else if (error.message.includes("Item is already in fixing")){
          title = "Item is already in fixing"
          errorMessage = "Please wait for operator to fix this item";
          icon = "warning"
        }
        SweetAlert.fire({
          title: title,
          text: errorMessage,
          icon: icon,
          confirmButtonColor: "#4F46E5",
        });
        
      } finally {
        onClose()
        setIsSending(false);
      }
    }
  };

  //...
  const confirmClose = () => {
    const hasUnsavedData = forms.some(
      (form) => form.serialNumber || form.problem || form.image || form.selectedProblems.length > 0
    );

    if (hasUnsavedData) {
      SweetAlert.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Are you sure you want to close?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4F46E5",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, close it",
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      confirmClose();
    }
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setForms(forms.map((f) =>
        f.id === id ? { ...f, image: file } : f
      ));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-4xl max-h-[80vh] rounded-2xl bg-white shadow-xl overflow-hidden border-gray-100 flex flex-col form-container"
        onClick={(e) => e.stopPropagation()}
      >
        {!user && (
          <div className="absolute top-4 right-4 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 z-20">
            <box-icon name="user" size="xs"></box-icon>
            <span>Guest Mode</span>
          </div>
        )}

        <div className="sticky top-0 z-10 p-6 bg-[#2f6690] text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <box-icon
                  name="file"
                  type="solid"
                  color="white"
                  size="md"
                ></box-icon>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Create Report</h1>
                <p className="text-sm text-white text-opacity-90">
                  {forms.length} report{forms.length !== 1 ? "s" : ""} ready
                </p>
              </div>
            </div>
            <button
              onClick={confirmClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              aria-label="Close"
            >
              <box-icon name="x" color="white"></box-icon>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative z-10 bg-[#D9DCD6]">
          <div className="space-y-5">
            {forms.map((form, index) => (
              <div
                key={form.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md ${form.isCollapsed ? "pb-0" : ""
                  }`}
              >
                <div
                  className={`flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-gray-50 to-white ${form.isCollapsed ? "border-b-0" : "border-b border-gray-200"
                    }`}
                  onClick={() => toggleCollapse(form.id)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapse(form.id);
                      }}
                      className="p-2 text-gray-500 hover:text-[#2f6690] rounded-lg hover:bg-gray-100 transition-all duration-200"
                      aria-label={form.isCollapsed ? "Expand" : "Collapse"}
                    >
                      <box-icon
                        name={form.isCollapsed ? "chevron-down" : "chevron-up"}
                      ></box-icon>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Report {index + 1}
                    </h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeForm(form.id);
                    }}
                    className="p-2 text-red-500 hover:text-white rounded-lg hover:bg-red-500 transition-all duration-200"
                    aria-label="Remove report"
                  >
                    <box-icon name="trash" size="sm"></box-icon>
                  </button>
                </div>

                <div className={`${form.isCollapsed ? "hidden" : "p-6"}`}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          Serial Number
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                        <input
                          type="text"
                          name="serialNumber"
                          value={form.serialNumber}
                          onChange={(e) => handleChange(form.id, e)}
                          className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#81c3d7] focus:border-[#3a7ca5] px-4 py-3 bg-white text-sm shadow-sm transition-all duration-200"
                          placeholder="Enter Serial Number"
                          required
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          Problem Description
                          <span className="text-red-500 ml-1">*</span>
                        </span>

                        <textarea
                          name="problem"
                          value={form.problem}
                          onChange={(e) => handleChange(form.id, e)}
                          className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#81c3d7] focus:border-[#3a7ca5] px-4 py-3 bg-white text-sm shadow-sm min-h-[120px] transition-all duration-200"
                          placeholder="Describe the problem or select from common problems below..."
                          required
                        />

                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Common problems (click to add):</p>
                          <div className="flex flex-wrap gap-2">
                            {commonProblems.map((problem) => (
                              <button
                                key={problem}
                                type="button"
                                onClick={() => handleSelectProblem(form.id, problem)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${form.selectedProblems.includes(problem)
                                    ? "bg-[#81c3d7] text-white border-[#81c3d7]"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  }`}
                              >
                                {problem}
                              </button>
                            ))}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* รูปภาพที่อัปโหลด */}
                    <div className="space-y-2">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Upload Image
                        </span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(form.id, e)}
                        className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#81c3d7] focus:border-[#3a7ca5] px-4 py-3 bg-white text-sm shadow-sm"
                      />
                      {form.image && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Preview:</p>
                          <img
                            src={URL.createObjectURL(form.image)}
                            alt="Uploaded Preview"
                            className="w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-gray-200 p-4 flex justify-between items-center z-10 shadow-sm">
          <button
            onClick={addNewForm}
            className="flex items-center gap-2 px-4 py-2.5 text-[#2f6690] font-medium rounded-lg border border-[#3a7ca5] hover:bg-[#81c3d7] hover:bg-opacity-20 transition-all duration-200 hover:shadow-sm"
            aria-label="Add another report"
          >
            <box-icon name="plus" color="#2f6690"></box-icon>
            <span>Add Another Report</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={confirmSend}
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6700] text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-[#FF6700]/90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Send reports"
            >
              {isSending ? (
                <>
                  <box-icon
                    name="loader-circle"
                    animation="spin"
                    color="white"
                  ></box-icon>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <box-icon name="send" color="white"></box-icon>
                  <span>
                    Send {forms.length} Report{forms.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isSending && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <box-icon
              name="loader-circle"
              animation="spin"
              color="#4F46E5"
            ></box-icon>
            <span>Sending reports...</span>
          </div>
        </div>
      )}
    </div>
  );
}

CreateForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    serialNumber: PropTypes.string,
    user: PropTypes.shape({
      user: PropTypes.string,
      role: PropTypes.string,
      display_name: PropTypes.string,
    })
  }),
};

export default CreateForm;


