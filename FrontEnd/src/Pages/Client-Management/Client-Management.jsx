import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import SweetAlert from "sweetalert2";
import "boxicons";
import "../Unassigned-Work/UnassignedWork.css";

const ClientManagement = () => {
  const { user } = useAuth();
  const [branchList, setBranchList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [searchClientTerm, setSearchClientTerm] = useState("");
  const [searchBranchTerm, setSearchBranchTerm] = useState("");
  const [itemCounts, setItemCounts] = useState({});
  const [editBranch, setEditBranch] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    client_branch_id: "",
    province: "",
    district: "",
    street: "",
    alley: "",
    building_number: "",
    postal_code: "",
    latitude: "",
    longitude: "",
  });

  const [createFormData, setCreateFormData] = useState({
    client_id: "",
    client_branch_id: "",
    location: {
      province: "",
      district: "",
      street: "",
      alley: "",
      building_number: "",
      postal_code: "",
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    fetch("http://localhost:3000/company/getAllCompany/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setClientList(res);
      })
      .catch((err) => console.error("Error fetching client data:", err));
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetch(`http://localhost:3000/company/getCompanyInfo/${selectedClient}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const branches = res[selectedClient] || [];
          setBranchList(branches);

          // Fetch item counts for all branches
          branches.forEach((branch) => {
            getItemBranchCount(selectedClient, branch.client_branch_id);
          });
        })
        .catch((err) => console.error("Error fetching branch data:", err));
    } else {
      setBranchList([]);
      setItemCounts({});
    }
  }, [selectedClient]);

  const getItemBranchCount = (clientId, branchId) => {
    fetch(
      `http://localhost:3000/item/getItemList/count/${clientId}/${branchId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((count) => {
        setItemCounts((prev) => ({
          ...prev,
          [branchId]: count,
        }));
      })
      .catch((err) => console.error("Error fetching item count:", err));
  };

  // Initialize map when edit form opens
  useEffect(() => {
    if (showEditForm || showCreateClientForm) {
      const initMap = () => {
        const initialLocation = showEditForm
          ? {
              lat: parseFloat(formData.latitude) || 13.7563,
              lng: parseFloat(formData.longitude) || 100.5018,
            }
          : { lat: 13.7563, lng: 100.5018 }; // Default to Bangkok

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: initialLocation,
          zoom: 15,
        });

        const markerInstance = new window.google.maps.Marker({
          position: initialLocation,
          map: mapInstance,
          draggable: true,
        });

        // Initialize Autocomplete
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          {
            types: ["geocode"],
            componentRestrictions: { country: "th" },
          }
        );

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (!place.geometry) return;

          mapInstance.panTo(place.geometry.location);
          markerInstance.setPosition(place.geometry.location);
          updateAddressFields(place);
        });

        // Add click listener to map
        mapInstance.addListener("click", (e) => {
          markerInstance.setPosition(e.latLng);
          reverseGeocode(e.latLng);
        });

        // Add dragend listener to marker
        markerInstance.addListener("dragend", (e) => {
          reverseGeocode(e.latLng);
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setAutocomplete(autocompleteInstance);

        // If editing, reverse geocode the existing location
        if (showEditForm && (formData.latitude || formData.longitude)) {
          reverseGeocode(
            new window.google.maps.LatLng(
              parseFloat(formData.latitude),
              parseFloat(formData.longitude)
            )
          );
        }
      };

      if (!window.google) {
        // Handle case where Google Maps API hasn't loaded yet
        const timer = setInterval(() => {
          if (window.google) {
            clearInterval(timer);
            initMap();
          }
        }, 100);
      } else {
        initMap();
      }
    }

    return () => {
      // Cleanup
      if (marker) marker.setMap(null);
      if (map) setMap(null);
    };
  }, [showEditForm, showCreateClientForm]);

  const reverseGeocode = (latLng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        updateAddressFields(results[0]);
      }
    });
  };

  const updateAddressFields = (place) => {
    const addressComponents = place.address_components || [];
    const geometry = place.geometry || {};
    
    let province = '';
    let district = '';
    let street = '';
    let alley = '';
    let buildingNumber = '';
    let postalCode = '';
  
    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('administrative_area_level_1')) {
        // Special case for Bangkok
        province = component.long_name.includes('Krung Thep') 
          ? 'Bangkok' 
          : component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('route')) {
        street = component.long_name;
      } else if (types.includes('street_number')) {
        buildingNumber = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    });
  
    // For edit form
    if (showEditForm) {
      setFormData(prev => ({
        ...prev,
        province: province || prev.province,
        district: district || prev.district,
        street: street || prev.street,
        building_number: buildingNumber || prev.building_number,
        postal_code: postalCode || prev.postal_code,
        latitude: geometry.location.lat() || prev.latitude,
        longitude: geometry.location.lng() || prev.longitude,
      }));
    } 
    // For create form
    else if (showCreateClientForm) {
      setCreateFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          province: province || prev.location.province,
          district: district || prev.location.district,
          street: street || prev.location.street,
          building_number: buildingNumber || prev.location.building_number,
          postal_code: postalCode || prev.location.postal_code,
          latitude: geometry.location.lat() || prev.location.latitude,
          longitude: geometry.location.lng() || prev.location.longitude,
        }
      }));
    }
  };

  const toggleSelectedClient = (Client) => {
    setSelectedClient(selectedClient === Client ? "" : Client);
  };

  const handleDeleteBranch = (branchId) => {
    SweetAlert.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2f6690",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `http://localhost:3000/company/deleteCompany/${selectedClient}/${branchId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok)
              throw new Error(data.message || "Failed to delete branch");
            return data;
          })
          .then(() => {
            // Remove branch from state
            setBranchList((prev) =>
              prev.filter((b) => b.client_branch_id !== branchId)
            );
            SweetAlert.fire(
              "Deleted!",
              "The branch has been deleted.",
              "success"
            ).then(() => {
              setShowEditForm(false);

              // Auto-fetch after successful deletion
              if (selectedClient) {
                fetch(
                  `http://localhost:3000/company/getCompanyInfo/${selectedClient}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                )
                  .then((res) => res.json())
                  .then((res) => {
                    const branches = res[selectedClient] || [];
                    setBranchList(branches);
                    branches.forEach((branch) => {
                      getItemBranchCount(
                        selectedClient,
                        branch.client_branch_id
                      );
                    });
                  });
              } else {
                fetch("http://localhost:3000/company/getAllCompany/", {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                })
                  .then((res) => res.json())
                  .then((res) => setClientList(res));
              }
            });
          })
          .catch((err) => {
            console.error("Delete error:", err);
            SweetAlert.fire({
              icon: "error",
              title: "Error",
              text: err.message || "Failed to delete branch",
            });
          });
      }
    });
  };

  const handleEditBranch = (branch) => {
    setEditBranch(branch);
    setFormData({
      client_branch_id: branch.client_branch_id,
      province: branch.location.province,
      district: branch.location.district,
      street: branch.location.street,
      alley: branch.location.alley || "",
      building_number: branch.location.building_number,
      postal_code: branch.location.postal_code,
      latitude: branch.location.latitude,
      longitude: branch.location.longitude,
    });
    setShowEditForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Prepare the request body
    const requestBody = {
      location: {
        province: formData.province,
        district: formData.district,
        street: formData.street,
        alley: formData.alley || null,
        building_number: formData.building_number,
        postal_code: formData.postal_code,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      },
    };

    fetch(
      `http://localhost:3000/company/updateCompany/${selectedClient}/${editBranch.client_branch_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      }
    )
      .then(async (res) => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          throw new Error(data.message || "Failed to update branch");
        }
        return data;
      })
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "No changes were made");
        }

        // Update the branch in state
        setBranchList((prev) =>
          prev.map((branch) =>
            branch.client_branch_id === editBranch.client_branch_id
              ? { ...branch, location: requestBody.location }
              : branch
          )
        );

        setShowEditForm(false);
        SweetAlert.fire({
          icon: "success",
          title: "Success!",
          text: data.message || "Branch updated successfully",
        });

        // Auto-fetch after successful edit
        if (selectedClient) {
          fetch(
            `http://localhost:3000/company/getCompanyInfo/${selectedClient}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
            .then((res) => res.json())
            .then((res) => {
              const branches = res[selectedClient] || [];
              setBranchList(branches);
              branches.forEach((branch) => {
                getItemBranchCount(selectedClient, branch.client_branch_id);
              });
            });
        } else {
          fetch("http://localhost:3000/company/getAllCompany/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((res) => res.json())
            .then((res) => setClientList(res));
        }
      })
      .catch((err) => {
        console.error("Update error:", err);
        SweetAlert.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to update branch",
        });
      });
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;

    if (selectedClient) {
      setCreateFormData((prev) => ({
        ...prev,
        client_id: selectedClient,
      }));
    }

    // Rest of your change handler logic...
    if (name in createFormData.location) {
      setCreateFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]:
            name === "latitude" || name === "longitude"
              ? parseFloat(value) || 0
              : value,
        },
      }));
    } else {
      setCreateFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    console.log(selectedClient);
    console.log(createFormData);
  };

  const handleCreateClient = (e) => {
    e.preventDefault();

    if (!createFormData.client_id) {
      SweetAlert.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a client ID",
      });
      return;
    }

    if (!createFormData.client_branch_id) {
      SweetAlert.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a branch ID",
      });
      return;
    }

    fetch(
      `http://localhost:3000/company/createCompany/${createFormData.client_id}/${createFormData.client_branch_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          location: {
            ...createFormData.location,
            alley: createFormData.location.alley || null,
          },
        }),
      }
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create client");
        return data;
      })
      .then(() => {
        SweetAlert.fire({
          icon: "success",
          title: "Success!",
          text: "Client created successfully",
          confirmButtonColor: "#2f6690",
        });
        setShowCreateClientForm(false);
        setCreateFormData({
          client_id: "",
          client_branch_id: "",
          location: {
            province: "",
            district: "",
            street: "",
            alley: "",
            building_number: "",
            postal_code: "",
            latitude: 0,
            longitude: 0,
          },
        });

        // Auto-fetch after successful creation
        if (selectedClient) {
          fetch(
            `http://localhost:3000/company/getCompanyInfo/${selectedClient}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
            .then((res) => res.json())
            .then((res) => {
              const branches = res[selectedClient] || [];
              setBranchList(branches);
              branches.forEach((branch) => {
                getItemBranchCount(selectedClient, branch.client_branch_id);
              });
            });
        } else {
          fetch("http://localhost:3000/company/getAllCompany/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((res) => res.json())
            .then((res) => setClientList(res));
        }
      });
  };

  const filteredClientList = clientList.filter((client) =>
    client.client_id.toLowerCase().includes(searchClientTerm.toLowerCase())
  );

  const filteredBranchList = branchList.filter((branch) =>
    branch.client_branch_id
      .toLowerCase()
      .includes(searchBranchTerm.toLowerCase())
  );

  return (
    <div className="unassigned-work-Admin flex gap-2">
      {/* Client LIST */}
      <div className="Worker-list flex flex-col gap-2 flex-1 bg-white p-1 drop-shadow-md rounded-lg">
        <div className="Worker-list-bar bg-secondary p-2 rounded-[8px] drop-shadow flex items-center border-2 border-white justify-between sticky top-0 z-10">
          <div className="Worker-list-header flex gap-1 justify-center items-center">
            <box-icon
              name="Buildings"
              type="regular"
              size="md"
              color="white"
            ></box-icon>
            <h2 className="text-white">Client</h2>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search Client..."
              className="rounded px-2 py-1 text-sm text-secondary outline-none"
              value={searchClientTerm}
              onChange={(e) => setSearchClientTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="Worker-list-container grid gap-1 max-h-[600px] overflow-y-scroll border-t-2 border-b-2 border-secondary pt-1 pb-1">
          {filteredClientList.map((Client) => (
            <div
              className={`Worker-list-item grid grid-cols-4 w-full h-[48px] justify-between items-center p-2 border-2 border-secondary rounded-[8px] cursor-pointer drop-shadow transition-all duration-200 ${
                selectedClient === Client.client_id
                  ? "text-white bg-secondary"
                  : "text-black bg-white"
              }`}
              key={Client.client_id}
              onClick={() => toggleSelectedClient(Client.client_id)}
            >
              <span className="col-span-2 flex gap-2 items-center">
                <box-icon
                  name="Buildings"
                  type="regular"
                  size="sm"
                  color={
                    selectedClient === Client.client_id ? "white" : "#3a7ca5"
                  }
                ></box-icon>
                {Client.client_id}
              </span>
              <span></span>
            </div>
          ))}
        </div>
      </div>

      {/* BRANCH LIST */}
      <div className="unassigned-work-list flex flex-col gap-2 min-w-fit flex-1 bg-white p-1 drop-shadow-md rounded-lg">
        <div className="unassigned-work-list-bar bg-highlight p-2 rounded-[8px] drop-shadow flex items-center justify-between sticky top-0 z-10 text-nowrap">
          <div className="unassigned-work-list-header flex gap-1 justify-center items-center">
            <box-icon
              name="Building"
              type="regular"
              size="md"
              color="white"
            ></box-icon>
            <h2 className="text-white">Branch</h2>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search branch..."
              className="rounded px-2 py-1 text-sm text-highlight outline-none"
              value={searchBranchTerm}
              onChange={(e) => setSearchBranchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="unassigned-work-list-container flex flex-col max-h-[552px] overflow-y-scroll border-b-2 border-t-2 border-highlight space-y-1 pt-1 pb-1">
          {filteredBranchList.map((branch) => (
            <div
              className="unassigned-work-list-item grid grid-cols-8 overflow-scroll w-full h-[48px] justify-between items-center p-2 bg-white border-2 border-highlight rounded-[8px] drop-shadow cursor-pointer hover:brightness-90 transition-all duration-200"
              key={branch.client_branch_id}
            >
              <span className="flex gap-2 items-center col-span-2">
                <box-icon
                  name="building"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
                {branch.client_branch_id}
              </span>
              <span className="col-span-3 flex items-center">
                <box-icon
                  name="map"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
                {branch.location.province}
              </span>
              <span className="col-span-2 flex items-center gap-1">
                <box-icon
                  name="spray-can"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
                {itemCounts[branch.client_branch_id] || 0}
              </span>
              <span
                className="col-span-1 flex justify-center items-center hover:brightness-90 bg-highlight rounded"
                onClick={() => handleEditBranch(branch)}
              >
                <box-icon
                  name="edit"
                  type="regular"
                  size="sm"
                  color="white"
                ></box-icon>
              </span>
            </div>
          ))}
        </div>

        {user.role === "Admin" && (
          <div className="unassigned-work-footer flex justify-end w-full bottom-0 h-[48px] bg-white p-1 border-2 border-highlight rounded-[8px]">
            <button
              className="flex justify-center items-center gap-1 px-2 text-white rounded bg-green-600 hover:brightness-110"
              onClick={() => setShowCreateClientForm(true)}
            >
              <span>Add Client</span>
              <box-icon name="plus" type="regular" color="white"></box-icon>
            </button>
          </div>
        )}
      </div>

      {showCreateClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-secondary">
              Create New Client
            </h2>
            <form onSubmit={handleCreateClient}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      Client ID
                    </label>
                    <input
                      type="text"
                      name="client_id"
                      value={selectedClient || createFormData.client_id}
                      onChange={handleCreateFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter client ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      Province
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={createFormData.location.province}
                      onChange={handleCreateFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={createFormData.location.district}
                      onChange={handleCreateFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      Street
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={createFormData.location.street}
                      onChange={handleCreateFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-secondary">
                        Alley
                      </label>
                      <input
                        type="text"
                        name="alley"
                        value={createFormData.location.alley}
                        onChange={handleCreateFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-secondary">
                        Building Number
                      </label>
                      <input
                        type="text"
                        name="building_number"
                        value={createFormData.location.building_number}
                        onChange={handleCreateFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={createFormData.location.postal_code}
                      onChange={handleCreateFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      Branch ID
                    </label>
                    <input
                      type="text"
                      name="client_branch_id"
                      value={createFormData.client_branch_id}
                      onChange={handleCreateFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-secondary">
                      Search Address
                    </label>
                    <input
                      ref={autocompleteRef}
                      type="text"
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Search for an address"
                    />
                  </div>
                  <div className="h-64 bg-gray-200 rounded-md overflow-hidden">
                    <div
                      ref={mapRef}
                      className="w-full h-full"
                      style={{ minHeight: "256px" }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-secondary">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={createFormData.location.latitude}
                        onChange={handleCreateFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-secondary">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={createFormData.location.longitude}
                        onChange={handleCreateFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClientForm(false)}
                  className="p-2 bg-red-500 text-white rounded-md flex justify-center items-center hover:bg-red-600"
                >
                  <box-icon name="x" color="white"></box-icon>
                </button>
                <button
                  type="submit"
                  className="p-2 bg-primary text-white rounded-md flex justify-center items-center hover:bg-secondary"
                >
                  <box-icon name="check" color="white"></box-icon>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BRANCH FORM MODAL - Updated with Map */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-secondary">
              Edit Branch
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Branch ID
                    </label>
                    <input
                      type="text"
                      name="client_branch_id"
                      value={formData.client_branch_id}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Province
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Alley
                      </label>
                      <input
                        type="text"
                        name="alley"
                        value={formData.alley}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Building Number
                      </label>
                      <input
                        type="text"
                        name="building_number"
                        value={formData.building_number}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                      Search Address
                    </label>
                    <input
                      ref={autocompleteRef}
                      type="text"
                      className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Search for an address"
                    />
                  </div>
                  <div className="h-64 bg-gray-200 rounded-md overflow-hidden">
                    <div
                      ref={mapRef}
                      className="w-full h-full"
                      style={{ minHeight: "256px" }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-secondary rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  {user.role === "Admin" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteBranch(formData.client_branch_id);
                      }}
                      className="hover:brightness-90 border-2 border-red-500 rounded p-2 flex justify-center items-center"
                    >
                      <box-icon
                        name="trash"
                        type="regular"
                        size="sm"
                        color="red"
                      ></box-icon>
                    </button>
                  )}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="p-2 bg-red-500 text-white rounded-md flex justify-center items-center hover:bg-red-600"
                  >
                    <box-icon name="x" color="white"></box-icon>
                  </button>
                  <button
                    type="submit"
                    className="p-2 bg-primary text-white rounded-md flex justify-center items-center hover:bg-secondary"
                  >
                    <box-icon name="check" color="white"></box-icon>
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
