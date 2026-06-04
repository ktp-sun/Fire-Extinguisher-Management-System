import { useState, useEffect } from "react";
import { useAuth } from "../../../Auth/AuthProvider";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2

const AddItemForm = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState(""); 
  const [branch, setBranch] = useState(""); 

  const [companyBranchData, setCompanyBranchData] = useState({});
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะการกำลังส่งข้อมูล
  const [formData, setFormData] = useState({
    item_client: "", 
    item_client_branch: "", 
    item_brand: "SafetyPlus",
    item_capacity: "3kg",
    item_color: "red",
    item_type: "foam",
    item_class: "ABC",
    item_quantity: 1,
    item_location: "",
  });

  useEffect(() => {
    const fetchCompanyBranches = async () => {
      try {
        const response = await fetch("http://localhost:3000/company/getCompanyBranch",{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        const data = await response.json();

        if (response.ok) {
          setCompanyBranchData(data);
          setIsLoading(false); 
        } else {
          console.error("Failed to fetch company and branch data");
        }
      } catch (error) {
        console.error("Error fetching company branches:", error);
        setIsLoading(false);
      }
    };

    fetchCompanyBranches();
  }, []); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCompanyChange = (e) => {
    const selectedCompany = e.target.value;
    setCompany(selectedCompany);
    setFormData({
      ...formData,
      item_client: selectedCompany,
      item_client_branch: "", 
    });
  };

  const handleBranchChange = (e) => {
    setBranch(e.target.value);
    setFormData({
      ...formData,
      item_client_branch: e.target.value,
    });
  };

  const handleQuantityChange = (e) => {
    setFormData({
      ...formData,
      item_quantity: e.target.value, 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_client || !formData.item_client_branch) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Select Company and Branch',
        text: 'You must select both Company and Branch before proceeding.',
      });
      return;
    }

    setIsSubmitting(true);

    const swalLoading = Swal.fire({
      title: 'Adding Item...',
      html: 'Please wait while we add your item.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const requestBody = {
        item_client: formData.item_client,
        item_client_branch: formData.item_client_branch,
        item_brand: formData.item_brand,
        item_capacity: formData.item_capacity,
        item_color: formData.item_color,
        item_type: formData.item_type,
        item_class: formData.item_class,
        item_quantity: formData.item_quantity,
        item_location: formData.item_location,
      };

      const response = await fetch(
        `http://localhost:3000/item/createItem/${company}/${branch}/${formData.item_quantity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({"data":requestBody,"user":user}),
        }
      );


      swalLoading.close();
      setIsSubmitting(false);

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Item Added Successfully!',
          text: 'Your new item has been added.',
        }).then(() => {
          onSubmit();
          onClose();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Create Item',
          text: 'There was an issue creating the item. Please try again.',
        });
      }
    } catch (error) {
      console.error("Error:", error);
      swalLoading.close();
      setIsSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again later.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold text-primary mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-4">Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <select
                name="item_client"
                value={formData.item_client}
                onChange={handleCompanyChange}
                className="border-2 border-primary rounded w-full p-2"
              >
                <option value="">Select Company</option>
                {Object.keys(companyBranchData).map((companyName) => (
                  <option key={companyName} value={companyName}>
                    {companyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Branch
              </label>
              <select
                name="item_client_branch"
                value={formData.item_client_branch}
                onChange={handleBranchChange}
                className="border-2 border-primary rounded w-full p-2"
                disabled={!company} 
              >
                <option value="">Select Branch</option>
                {companyBranchData[company]?.map((branchName) => (
                  <option key={branchName} value={branchName}>
                    {branchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Location
              </label>
              <input
                type="text"
                name="item_location"
                value={formData.item_location}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <select
                name="item_brand"
                value={formData.item_brand}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
              >
                <option value="SafetyPlus">SafetyPlus</option>
                <option value="SafePro">SafePro</option>
                <option value="Chubb">Chubb</option>
                <option value="FireGuard">FireGuard</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="item_type"
                value={formData.item_type}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
              >
                <option value="foam">Foam</option>
                <option value="liquid">Liquid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <select
                name="item_capacity"
                value={formData.item_capacity}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
              >
                <option value="3kg">3 KG</option>
                <option value="5kg">5 KG</option>
                <option value="7kg">7 KG</option>
                <option value="10kg">10 KG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <select
                name="item_color"
                value={formData.item_color}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
              >
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="silver">Silver</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Class
              </label>
              <input
                type="text"
                name="item_class"
                value={formData.item_class}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
                required
              />
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="item_quantity"
                value={formData.item_quantity}
                onChange={handleQuantityChange}
                className="border-2 border-primary rounded w-full p-2"
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-primary bg-white rounded px-4 py-2 text-primary transition-all duration-300 ease-in-out hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-2 border-primary bg-primary rounded px-4 py-2 text-white transition-all duration-300 ease-in-out hover:bg-secondary hover:border-secondary"
              disabled={isSubmitting} 
            >
              {isSubmitting ? "Adding Item..." : "Add Item"} {/* แสดงข้อความที่ต่างกัน */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;

