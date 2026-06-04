import { useEffect, useState } from "react";
import CreateForm from "../../Component/CreateForm";
import Logo from "../../assets/Logo/Logo1.png";
import placeholder from "../../assets/img/placeholder.png";
import "./ProductPage.css";
import "boxicons";

const ProductPage = ({ id }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isReportSent, setIsReportSent] = useState(false);

  // ตั้งค่า Guest User โดยตรงในหน้านี้
  const guestUser = {
    user: 'guest',
    role: 'guest',
    name: 'Guest User',
    email: 'guest@example.com'
  };

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3000/item/getItemInfo/${id}`)
      .then((response) => response.json())
      .then((result) => setSelectedData(result))
      .catch((error) => console.error(error));
  }, [id]);

  const handleReportSubmit = () => {
    setIsReportSent(true);
    setShowForm(false);
    
    setTimeout(() => {
      setIsReportSent(false);
    }, 3000);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const sendGuestReport = async (formData) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/report/createReport/${formData.serialNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              send_by: 'guest',
              problem: formData.problem,
            },
            user: guestUser,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting guest report:", error);
      throw error;
    }
  };

  if (selectedData) {
    if(selectedData.length <= 0) {
      return (
        <div className="flex flex-col bg-light min-h-screen justify-center items-center">
          <div className="product-container bg-white p-4 flex flex-col justify-center items-center rounded-lg h-fit drop-shadow">
            <div className="product-logo flex justify-center">
              <img className="w-[256px]" src={Logo} alt="Logo" />
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <box-icon name="question-mark" color="#FD6E28" size="lg"></box-icon>
              <span className="text-2xl">Product Not Found</span>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="product-page flex gap-2 bg-light justify-center items-center min-h-fit h-screen">
      {/* Notification เมื่อรายงานส่งสำเร็จ */}
      {isReportSent && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Report submitted successfully as Guest!
        </div>
      )}

      <div className="product-container flex gap-4 bg-white p-4 flex-wrap justify-center items-center rounded-lg h-fit drop-shadow-md">
        <div className="product-left flex flex-col gap-4">
          <div className="product-logo flex justify-center">
            <img className="w-[256px]" src={Logo} alt="Logo" />
          </div>
          <div className="product-image flex justify-center items-center rounded-lg drop-shadow">
            <img src={placeholder} alt="Product" />
          </div>
        </div>
        <div className="product-right flex justify-center items-center flex-col gap-4">
          <div className="product-info">
            <div className="product-table-container">
              <table className="flex flex-col product-table gap-2">
                <thead>
                  <tr>
                    <th colSpan={2} className="text-center rounded-lg">
                      <h2>Fire Extinguisher Details</h2>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData &&
                    Object.entries(selectedData).map(([key, value]) => {
                      return (
                        <tr key={key}>
                          <td className="font-bold text-lg">{key.replace('_', ' ')}</td>
                          <td className="text-lg">{value}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="product-report">
            <div className="report-button flex justify-center">
              <button
                className="rounded-lg px-4 py-2 bg-secondary flex justify-center items-center gap-4 filter hover:brightness-110"
                onClick={() => setShowForm(true)}
              >
                <box-icon name="send" size="md" color="white"></box-icon>
                <span className="text-white font-bold text-3xl">Report as Guest</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CreateForm Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div 
            className="absolute inset-0"
            onClick={handleCloseForm}
          ></div>
          <CreateForm
            onClose={handleCloseForm}
            onSuccess={handleReportSubmit}
            initialData={{
              serialNumber: id || "",
              user: guestUser // ส่ง guestUser ไปยัง CreateForm
            }}
            customSubmitHandler={sendGuestReport}
          />
        </div>
      )}
    </div>
  );
};

export default ProductPage;