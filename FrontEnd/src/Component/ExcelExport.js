import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ExportExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = Object.keys(data[0]).map((key) => {
        const maxContentLength = Math.max(
            key.length, 
            ...data.map((row) => (row[key] ? row[key].toString().length : 0)) 
        );
        return { wch: maxContentLength + 2 };
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const fileData = new Blob([excelBuffer], {
        type: "application/octet-stream",
    });
    saveAs(fileData, "ItemLists.xlsx");
}

export default ExportExcel;