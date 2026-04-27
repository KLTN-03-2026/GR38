export const extractTextFromPDF = async (pdfUrl) => {
    try {
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        // 1. Tải file PDF từ Cloudinary URL về thay vì đọc từ ổ cứng cục bộ
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`Không thể tải PDF từ URL: ${response.statusText}`);
        
        // 2. Chuyển đổi dữ liệu tải về thành Uint8Array cho pdfjs
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // 3. Tiến hành phân tích PDF như code cũ của bạn
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDoc = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            // Thêm khoảng trắng để các từ không bị dính vào nhau
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