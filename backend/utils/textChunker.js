/**
 * Chia văn bản thành các đoạn nhỏ (chunk) để AI xử lý tốt hơn
 * @param {string} text - Toàn bộ văn bản cần chia nhỏ
 * @param {number} chunkSize - Kích thước mục tiêu của mỗi đoạn (tính bằng số từ)
 * @param {number} overlap - Số từ chồng chéo (kết nối) giữa các đoạn
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Làm sạch văn bản trong khi vẫn giữ nguyên cấu trúc đoạn văn
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')
    .trim();

  // Thử chia văn bản theo các đoạn văn (một hoặc hai ký tự xuống dòng)
  const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // Nếu một đoạn văn đơn lẻ dài vượt quá kích thước chunk, hãy chia nó theo từng từ
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join('\n\n'),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Chia đoạn văn lớn thành các chunk nhỏ dựa trên số từ
      for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // Nếu thêm đoạn văn này làm vượt quá kích thước chunk, hãy lưu chunk hiện tại lại
    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      // Tạo phần chồng chéo (overlap) từ chunk trước đó để giữ ngữ cảnh
      const prevChunkText = currentChunk.join(' ');
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // Thêm đoạn văn vào chunk hiện tại nếu vẫn còn chỗ chứa
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Thêm chunk cuối cùng vào mảng nếu có
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join('\n\n'),
      chunkIndex: chunkIndex,
      pageNumber: 0
    });
  }

  // Xử lý dự phòng (Fallback): nếu không có chunk nào được tạo ra, hãy chia nhỏ trực tiếp theo từng từ
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(' '),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

/**
 * Tìm các chunk (đoạn văn bản) có liên quan dựa trên việc khớp từ khóa
 * @param {Array<Object>} chunks - Mảng chứa các chunk
 * @param {string} query - Câu truy vấn tìm kiếm
 * @param {number} maxChunks - Số lượng chunk tối đa trả về
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  // Các từ dừng (stop words) phổ biến cần loại trừ
  const stopWords = new Set([
    'và', 'hoặc', 'nhưng', 'của', 'là', 'các', 'những', 'một', 'thì', 'mà',
    'để', 'với', 'cho', 'trong', 'trên', 'dưới', 'tại', 'bởi', 'này', 'kia'
  ]);

  // Trích xuất và làm sạch các từ trong câu truy vấn
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    // Trả về các đối tượng chunk sạch không chứa siêu dữ liệu (metadata) của Mongoose
    return chunks.slice(0, maxChunks).map(chunk => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Tính điểm cho mỗi từ trong câu truy vấn
    for (const word of queryWords) {
      // Khớp chính xác từ (điểm cao hơn)
      const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score += exactMatches * 3;

      // Khớp một phần (điểm thấp hơn)
      const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Điểm thưởng: Tìm thấy nhiều từ khác nhau trong câu truy vấn
    const uniqueWordsFound = queryWords.filter(word => 
      content.includes(word)
    ).length;
    
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // Chuẩn hóa điểm số dựa trên độ dài của nội dung
    const normalizedScore = score / Math.sqrt(contentWords);

    // Điểm thưởng nhỏ cho các chunk nằm ở vị trí đầu
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    // Trả về đối tượng sạch không chứa siêu dữ liệu Mongoose
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound
    };
  });

  return scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => {
      // Sắp xếp theo điểm số (giảm dần)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Nếu điểm bằng nhau, ưu tiên chunk có nhiều từ khóa khớp hơn
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      // Cuối cùng, ưu tiên theo thứ tự xuất hiện ban đầu (tăng dần)
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};