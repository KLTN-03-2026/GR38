import fs from 'fs/promises';
import path from 'path';

export const extractTextFromPDF = async (filePath) => {
    try {
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const dataBuffer = await fs.readFile(filePath);
        const uint8Array = new Uint8Array(dataBuffer);
        
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDoc = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        console.log("Text length:", fullText.length);
        
        return {
            text: fullText,
            numPages: pdfDoc.numPages,
            info: {},
        };
    } catch (error) {
        console.error("PDF phân tích lỗi:", error);
        throw new Error("Phân tích PDF thất bại");
    }
};