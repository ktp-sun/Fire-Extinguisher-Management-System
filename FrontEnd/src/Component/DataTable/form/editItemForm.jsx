import { useState, useEffect } from "react";
import { useAuth } from "../../../Auth/AuthProvider";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2

const EditItemForm = ({ onClose, onSubmit, initialData }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    item_id: initialData?.item_id || "",
    item_brand: initialData?.item_brand || "",
    item_capacity: initialData?.item_capacity || "",
    item_color: initialData?.item_color || "red",
    item_type: initialData?.item_type || "",
    item_class: initialData?.item_class || "",
    item_location: initialData?.item_location || "", // เพิ่ม item_location
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        item_id: initialData.item_id || "",
        item_brand: initialData.item_brand || "",
        item_capacity: initialData.item_capacity || "",
        item_color: initialData.item_color || "red",
        item_type: initialData.item_type || "",
        item_class: initialData.item_class || "",
        item_location: initialData.item_location || "", // เพิ่ม item_location
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { item_id, ...requestBody } = formData;

      const response = await fetch(
        `http://localhost:3000/item/updateItem/${formData.item_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ data: formData, user: user }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Item Updated Successfully!',
          text: 'The item has been updated.',
        }).then(() => {
          onSubmit();
          onClose();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'There was an issue updating the item. Please try again.',
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again later.',
      });
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:3000/item/deleteItem/${formData.item_id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ user: user }),
            }
          );

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Item Deleted!',
              text: 'The item has been deleted.',
            }).then(() => {
              onSubmit();
              onClose();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: 'There was an issue deleting the item. Please try again.',
            });
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.',
          });
        }
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-4">Edit Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                Item Brand
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
                Item Capacity
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
                Item Color
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
                Item Type
              </label>
              <select
                name="item_type"
                value={formData.item_type}
                onChange={handleChange}
                className="border-2 border-primary rounded w-full p-2"
              >
                <option value="Foam">Foam</option>
                <option value="Liquid">Liquid</option>
                <option value="Fire Extinguisher">Fire Extinguisher</option>
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
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="border-2 border-red-500 bg-red-500 text-white rounded px-4 py-2 transition-all duration-300 ease-in-out hover:bg-red-600 hover:border-red-600"
            >
              Delete
            </button>
            <div className="flex space-x-2">
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
              >
                Confirm Edit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemForm;

