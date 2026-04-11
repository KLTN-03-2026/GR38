import fs from 'fs/promises'
import { PDFParse } from 'pdf-parse'

/** 
Xuat van ban tu file PDF
*@param {string} filePath - Path to PDF file
*@returns {Promise<{text : string, numPages: number}>}
*/
export const extractTextFromPDF = async (filePath) => {
    try{
        const dataBuffer = await fs.readFile(filePath);
        // Sử dụng pdf-parse để trích xuất văn bản
        const data = await PDFParse(dataBuffer);
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    }catch (error) {
        console.error("PDF phân tích lỗi:", error);
        throw new Error("Phân tích PDF thất bại");
    }
};