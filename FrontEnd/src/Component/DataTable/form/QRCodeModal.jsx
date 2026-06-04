import React, { useEffect, useState, useRef } from "react";
import ReactQR from "react-qr-code"; // ใช้ react-qr-code

const QRCodeModal = ({ onClose, id }) => {
    const qrCodeRef = useRef();
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    useEffect(() => {
        // สร้าง URL สำหรับ QR Code
        setQrCodeUrl(`http://${window.location.host}/?id=${id}`);
    }, [id]);

    // ฟังก์ชันดาวน์โหลด QR Code
    const downloadQRCode = () => {
        const svg = qrCodeRef.current.querySelector("svg");
        if (svg) {
            const xml = new XMLSerializer().serializeToString(svg);
            const imageUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = `QR_Code_${id}.svg`; // ตั้งชื่อไฟล์ดาวน์โหลด
            link.click(); // จำลองการคลิกเพื่อดาวน์โหลด
        }
    };

    // ฟังก์ชันพิมพ์ QR Code
    const printQRCode = () => {
        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write("<html><body>");
        printWindow.document.write(`
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
        }
        .qr-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        svg {
          width: 100%;
          height: 100%;
        }
      </style>
    `);
        printWindow.document.write(`<div class="qr-container">${qrCodeRef.current.innerHTML}</div>`);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
                    QR Code for Item <br /> {id}
                </h2>
                <div ref={qrCodeRef} className="flex justify-center items-center mb-6">
                    <ReactQR value={qrCodeUrl} size={128} />
                </div>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={downloadQRCode}
                        className="border-2 border-primary bg-white rounded px-6 py-3 text-primary font-semibold"
                    >
                        Download QR Code (SVG)
                    </button>
                    <button
                        onClick={printQRCode}
                        className="border-2 border-primary bg-white rounded px-6 py-3 text-primary font-semibold"
                    >
                        Print QR Code
                    </button>
                    <button
                        onClick={onClose}
                        className="border-2 border-primary bg-white rounded px-6 py-3 text-primary font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>

    );
};

export default QRCodeModal;
