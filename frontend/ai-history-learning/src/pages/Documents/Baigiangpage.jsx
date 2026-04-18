import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

// ============ DATA — mỗi bài có nội dung riêng ============
const documentsData = {
  1: {
    title: "Chiến tranh Điện Biên Phủ",
    img: "/anh6.jpg",
    duration: "158h50p",
    description: "Tài liệu về chiến dịch Điện Biên Phủ lịch sử năm 1954, đánh dấu sự kết thúc của chủ nghĩa thực dân Pháp tại Đông Dương.",
    chapters: [
      {
        id: 1,
        title: "Chương 1: Bối cảnh lịch sử",
        duration: "45p",
        content: [
          { type: "heading", text: "1.1 Tình hình thế giới sau Thế chiến II" },
          { type: "paragraph", text: "Sau Chiến tranh thế giới thứ hai (1939–1945), trật tự thế giới có nhiều biến động lớn. Các cường quốc thực dân châu Âu bị suy yếu nghiêm trọng, trong khi phong trào giải phóng dân tộc ở châu Á, châu Phi và Mỹ Latinh nổi lên mạnh mẽ. Liên Xô và Mỹ trở thành hai siêu cường đối đầu nhau trong Chiến tranh Lạnh." },
          { type: "paragraph", text: "Tại Đông Dương, thực dân Pháp cố gắng tái lập sự kiểm soát sau khi Nhật Bản đầu hàng. Tuy nhiên, nhân dân Việt Nam dưới sự lãnh đạo của Chủ tịch Hồ Chí Minh đã tuyên bố độc lập vào ngày 2 tháng 9 năm 1945." },
          { type: "heading", text: "1.2 Cuộc kháng chiến chống Pháp (1945–1954)" },
          { type: "paragraph", text: "Kháng chiến toàn quốc bùng nổ vào ngày 19 tháng 12 năm 1946 khi Pháp gửi tối hậu thư yêu cầu Việt Minh giải giáp vũ khí. Chủ tịch Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến, mở đầu cuộc chiến kéo dài gần 9 năm." },
          { type: "highlight", text: "\"Chúng ta thà hy sinh tất cả, chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ.\" — Hồ Chí Minh, 19/12/1946" },
          { type: "paragraph", text: "Trong giai đoạn đầu, quân Việt Minh áp dụng chiến thuật du kích, tránh đối đầu trực tiếp với quân Pháp có vũ khí hiện đại hơn. Dần dần, lực lượng kháng chiến trưởng thành và chuyển sang phản công với các chiến dịch lớn như Việt Bắc (1947), Biên Giới (1950)." },
          { type: "image", src: "/anh6.jpg", caption: "Quân và dân Việt Nam trong cuộc kháng chiến chống Pháp" },
        ],
      },
      {
        id: 2,
        title: "Chương 2: Diễn biến chiến dịch",
        duration: "60p",
        content: [
          { type: "heading", text: "2.1 Kế hoạch Navarre và tập đoàn cứ điểm Điện Biên Phủ" },
          { type: "paragraph", text: "Tháng 5 năm 1953, tướng Henri Navarre được cử sang làm Tổng chỉ huy quân đội Pháp tại Đông Dương. Ông đề ra kế hoạch Navarre nhằm giành thế chủ động chiến lược, kết thúc chiến tranh trong vòng 18 tháng." },
          { type: "paragraph", text: "Tháng 11 năm 1953, Pháp cho quân nhảy dù xuống Điện Biên Phủ, xây dựng tập đoàn cứ điểm gồm 49 cứ điểm với 16.000 quân, được trang bị đầy đủ pháo binh, xe tăng và máy bay. Pháp gọi đây là \"pháo đài bất khả xâm phạm\"." },
          { type: "highlight", text: "Tướng De Castries được cử làm chỉ huy tập đoàn cứ điểm. Pháp tin tưởng rằng Việt Minh không thể kéo pháo vào vị trí tấn công trên các sườn núi bao quanh lòng chảo Điện Biên Phủ." },
          { type: "heading", text: "2.2 Quyết định lịch sử: Thay đổi phương châm tác chiến" },
          { type: "paragraph", text: "Ban đầu, ta chủ trương \"đánh nhanh, thắng nhanh\". Tuy nhiên, sau khi nghiên cứu kỹ địch tình, Đại tướng Võ Nguyên Giáp đã quyết định hoãn cuộc tấn công và thay đổi phương châm thành \"đánh chắc, tiến chắc\". Đây là một quyết định lịch sử, thể hiện bản lĩnh và trí tuệ của người chỉ huy." },
          { type: "heading", text: "2.3 Ba đợt tấn công" },
          { type: "paragraph", text: "Đợt 1 (13–17/3/1954): Quân ta tấn công và tiêu diệt các cứ điểm Him Lam, Độc Lập, Bản Kéo — những cứ điểm án ngữ phía Bắc và Đông Bắc." },
          { type: "paragraph", text: "Đợt 2 (30/3–30/4/1954): Quân ta tiến công các cứ điểm phía Đông như E1, D1, C1, C2. Trận chiến diễn ra ác liệt, ta và địch giành giật nhau từng tấc đất." },
          { type: "paragraph", text: "Đợt 3 (1–7/5/1954): Quân ta tổng tấn công toàn bộ tập đoàn cứ điểm. Chiều 7/5/1954, lá cờ Quyết chiến Quyết thắng tung bay trên nóc hầm chỉ huy của De Castries." },
          { type: "image", src: "/anh6.jpg", caption: "Bộ đội Việt Nam kéo pháo vào trận địa Điện Biên Phủ" },
        ],
      },
      {
        id: 3,
        title: "Chương 3: Kết quả & Ý nghĩa lịch sử",
        duration: "30p",
        content: [
          { type: "heading", text: "3.1 Kết quả chiến dịch" },
          { type: "paragraph", text: "Sau 56 ngày đêm chiến đấu (13/3 – 7/5/1954), chiến dịch Điện Biên Phủ kết thúc thắng lợi hoàn toàn. Tổng số quân Pháp bị loại khỏi vòng chiến đấu là 16.200 tên, trong đó có 1 thiếu tướng, 16 đại tá và trung tá." },
          { type: "highlight", text: "Chiến thắng Điện Biên Phủ được Chủ tịch Hồ Chí Minh đánh giá: \"Lừng lẫy năm châu, chấn động địa cầu\"" },
          { type: "heading", text: "3.2 Ý nghĩa lịch sử" },
          { type: "paragraph", text: "Chiến thắng Điện Biên Phủ đã đập tan hoàn toàn kế hoạch Navarre, buộc Pháp phải ký kết Hiệp định Genève (21/7/1954), chấm dứt chiến tranh xâm lược Đông Dương." },
          { type: "paragraph", text: "Về ý nghĩa quốc tế, chiến thắng Điện Biên Phủ đã cổ vũ mạnh mẽ phong trào giải phóng dân tộc trên toàn thế giới, đặc biệt tại châu Á và châu Phi." },
          { type: "heading", text: "3.3 Hiệp định Genève 1954" },
          { type: "paragraph", text: "Ngày 21 tháng 7 năm 1954, Hiệp định Genève được ký kết, công nhận độc lập, chủ quyền và toàn vẹn lãnh thổ của Việt Nam, Lào và Campuchia." },
          { type: "image", src: "/anh6.jpg", caption: "Lễ ký kết Hiệp định Genève năm 1954" },
        ],
      },
    ],
  },

  2: {
    title: "Kháng chiến chống Mỹ",
    img: "/anh1.jpg",
    duration: "158h50p",
    description: "Tài liệu về cuộc kháng chiến chống Mỹ cứu nước (1954–1975) — cuộc chiến tranh giải phóng dân tộc vĩ đại của nhân dân Việt Nam.",
    chapters: [
      {
        id: 1,
        title: "Chương 1: Bối cảnh sau Hiệp định Genève",
        duration: "40p",
        content: [
          { type: "heading", text: "1.1 Đất nước bị chia cắt" },
          { type: "paragraph", text: "Sau Hiệp định Genève năm 1954, Việt Nam bị tạm thời chia cắt tại vĩ tuyến 17. Miền Bắc bước vào thời kỳ xây dựng chủ nghĩa xã hội dưới sự lãnh đạo của Đảng Lao động Việt Nam và Chủ tịch Hồ Chí Minh. Miền Nam đặt dưới sự kiểm soát của chính quyền Ngô Đình Diệm được Mỹ hậu thuẫn." },
          { type: "highlight", text: "Hiệp định Genève quy định tổ chức tổng tuyển cử thống nhất đất nước vào năm 1956, nhưng chính quyền Sài Gòn và Mỹ đã phá hoại điều khoản này." },
          { type: "heading", text: "1.2 Mỹ can thiệp vào miền Nam" },
          { type: "paragraph", text: "Từ năm 1954, Mỹ thay thế Pháp, đổ tiền của và cố vấn quân sự vào miền Nam Việt Nam nhằm ngăn chặn sự lan rộng của chủ nghĩa cộng sản. Chính sách này nằm trong chiến lược \"ngăn chặn\" (Containment Policy) của Mỹ trong thời kỳ Chiến tranh Lạnh." },
          { type: "image", src: "/anh1.jpg", caption: "Phong trào đấu tranh của nhân dân miền Nam" },
        ],
      },
      {
        id: 2,
        title: "Chương 2: Các giai đoạn chiến tranh",
        duration: "70p",
        content: [
          { type: "heading", text: "2.1 Chiến lược Chiến tranh đặc biệt (1961–1965)" },
          { type: "paragraph", text: "Dưới thời Tổng thống Kennedy, Mỹ áp dụng chiến lược \"Chiến tranh đặc biệt\" với mục tiêu dùng quân đội Sài Gòn làm lực lượng chiến đấu chính, còn Mỹ chỉ cung cấp cố vấn, vũ khí và tiền bạc. Chương trình ấp chiến lược được triển khai nhằm cô lập lực lượng giải phóng khỏi dân chúng." },
          { type: "heading", text: "2.2 Chiến tranh cục bộ (1965–1968)" },
          { type: "paragraph", text: "Tháng 8/1964, Mỹ dựng lên sự kiện Vịnh Bắc Bộ để có cớ leo thang chiến tranh. Từ tháng 3/1965, Mỹ đổ quân chiến đấu vào miền Nam, đồng thời tiến hành chiến dịch ném bom miền Bắc (Chiến dịch Rolling Thunder)." },
          { type: "highlight", text: "Tết Mậu Thân 1968: Quân Giải phóng đồng loạt tấn công vào hầu hết các đô thị miền Nam, tạo ra bước ngoặt chiến lược, làm lung lay ý chí chiến tranh của Mỹ." },
          { type: "heading", text: "2.3 Việt Nam hóa chiến tranh (1969–1973)" },
          { type: "paragraph", text: "Dưới thời Nixon, Mỹ áp dụng chiến lược \"Việt Nam hóa chiến tranh\", rút dần quân Mỹ về nước và tăng cường trang bị cho quân đội Sài Gòn." },
          { type: "image", src: "/anh1.jpg", caption: "Quân Giải phóng tiến công trong chiến dịch Mậu Thân 1968" },
        ],
      },
      {
        id: 3,
        title: "Chương 3: Đại thắng mùa Xuân 1975",
        duration: "45p",
        content: [
          { type: "heading", text: "3.1 Hiệp định Paris 1973" },
          { type: "paragraph", text: "Ngày 27/1/1973, Hiệp định Paris được ký kết, buộc Mỹ rút toàn bộ quân khỏi miền Nam Việt Nam. Tuy nhiên, chiến tranh vẫn tiếp tục giữa quân Giải phóng và quân đội Sài Gòn." },
          { type: "heading", text: "3.2 Chiến dịch Hồ Chí Minh" },
          { type: "paragraph", text: "Ngày 26/4/1975, Chiến dịch Hồ Chí Minh lịch sử bắt đầu. Năm cánh quân từ nhiều hướng tiến về Sài Gòn. Ngày 30/4/1975, xe tăng quân Giải phóng húc đổ cổng Dinh Độc Lập." },
          { type: "highlight", text: "11 giờ 30 phút ngày 30 tháng 4 năm 1975 — Lá cờ Giải phóng tung bay trên nóc Dinh Độc Lập, kết thúc 21 năm kháng chiến chống Mỹ cứu nước." },
          { type: "paragraph", text: "Chiến thắng 30/4/1975 đã hoàn thành sự nghiệp giải phóng miền Nam, thống nhất đất nước, kết thúc cuộc chiến tranh dài nhất và khốc liệt nhất trong lịch sử Việt Nam hiện đại." },
          { type: "image", src: "/anh1.jpg", caption: "Xe tăng quân giải phóng tiến vào Dinh Độc Lập 30/4/1975" },
        ],
      },
    ],
  },

  3: {
    title: "Lịch sử Việt Nam thời tiền sử",
    img: "/anh2.jpg",
    duration: "158h50p",
    description: "Tìm hiểu về lịch sử Việt Nam từ thời tiền sử đến buổi đầu dựng nước, bao gồm các nền văn hóa khảo cổ học tiêu biểu.",
    chapters: [
      {
        id: 1,
        title: "Chương 1: Thời kỳ đồ đá",
        duration: "35p",
        content: [
          { type: "heading", text: "1.1 Văn hóa Sơn Vi" },
          { type: "paragraph", text: "Văn hóa Sơn Vi (khoảng 20.000 – 12.000 năm trước Công nguyên) là một trong những nền văn hóa đồ đá cũ tiêu biểu trên lãnh thổ Việt Nam. Di chỉ phân bố chủ yếu ở vùng trung du Bắc Bộ, đặc biệt ở Phú Thọ." },
          { type: "heading", text: "1.2 Văn hóa Hòa Bình" },
          { type: "paragraph", text: "Văn hóa Hòa Bình (khoảng 12.000 – 7.000 năm TCN) được phát hiện đầu tiên ở tỉnh Hòa Bình, Việt Nam. Đây là nền văn hóa đồ đá giữa nổi tiếng thế giới, được coi là một trong những cái nôi của nông nghiệp trồng lúa đầu tiên." },
          { type: "highlight", text: "Nhà khảo cổ học người Pháp Madeleine Colani đã đặt tên \"Văn hóa Hòa Bình\" vào năm 1927 sau khi phát hiện và nghiên cứu các di chỉ trong các hang động núi đá vôi." },
          { type: "heading", text: "1.3 Văn hóa Bắc Sơn" },
          { type: "paragraph", text: "Văn hóa Bắc Sơn (khoảng 10.000 – 6.000 năm TCN) được phát hiện ở Lạng Sơn. Người Bắc Sơn đã biết mài nhẵn công cụ đá, đánh dấu bước tiến quan trọng trong kỹ thuật chế tác đồ đá." },
          { type: "image", src: "/anh2.jpg", caption: "Hiện vật đồ đá của văn hóa Hòa Bình tìm thấy tại Việt Nam" },
        ],
      },
      {
        id: 2,
        title: "Chương 2: Thời kỳ đồ đồng — Văn hóa Đông Sơn",
        duration: "50p",
        content: [
          { type: "heading", text: "2.1 Trống đồng Đông Sơn" },
          { type: "paragraph", text: "Văn hóa Đông Sơn (khoảng 700 TCN – 100 SCN) là đỉnh cao của nền văn minh đồ đồng ở Việt Nam. Trống đồng Đông Sơn là biểu tượng nổi tiếng nhất, được tìm thấy ở nhiều nơi trên lãnh thổ Việt Nam và các nước Đông Nam Á." },
          { type: "paragraph", text: "Trống đồng không chỉ là nhạc khí mà còn là biểu tượng quyền lực, được dùng trong các nghi lễ tôn giáo, cầu mưa, và các lễ hội cộng đồng. Hình khắc trên mặt trống phản ánh đời sống sinh hoạt, tín ngưỡng phong phú của người Việt cổ." },
          { type: "highlight", text: "Trống đồng Ngọc Lũ — được tìm thấy ở Hà Nam — là một trong những trống đồng Đông Sơn đẹp và hoàn chỉnh nhất, hiện được lưu giữ tại Bảo tàng Lịch sử Quốc gia Việt Nam." },
          { type: "image", src: "/anh2.jpg", caption: "Trống đồng Đông Sơn — biểu tượng văn minh Việt cổ" },
        ],
      },
      {
        id: 3,
        title: "Chương 3: Nhà nước Văn Lang – Âu Lạc",
        duration: "40p",
        content: [
          { type: "heading", text: "3.1 Nhà nước Văn Lang" },
          { type: "paragraph", text: "Nhà nước Văn Lang được coi là nhà nước đầu tiên trong lịch sử Việt Nam, được thành lập khoảng thế kỷ VII TCN. Kinh đô đặt tại Phong Châu (nay thuộc tỉnh Phú Thọ). Nhà nước do các Vua Hùng đứng đầu, truyền được 18 đời." },
          { type: "paragraph", text: "Cư dân Văn Lang sống chủ yếu bằng nghề trồng lúa nước, đánh cá, đúc đồng. Xã hội phân chia thành nhiều tầng lớp: Vua Hùng, Lạc hầu, Lạc tướng, Lạc dân và nô lệ." },
          { type: "heading", text: "3.2 Nhà nước Âu Lạc" },
          { type: "paragraph", text: "Khoảng năm 208 TCN, Thục Phán hợp nhất bộ tộc Âu Việt với Lạc Việt, lập ra nhà nước Âu Lạc, xưng là An Dương Vương. Kinh đô dời về Cổ Loa (nay thuộc Hà Nội). Thành Cổ Loa với kiến trúc xoắn ốc độc đáo là công trình quân sự xuất sắc thời bấy giờ." },
          { type: "highlight", text: "Truyền thuyết nỏ thần Kim Quy phản ánh thực tế lịch sử: quân Âu Lạc sở hữu vũ khí bộ binh tiên tiến (nỏ liên hoàn) giúp đánh bại quân xâm lược Triệu Đà trong giai đoạn đầu." },
          { type: "image", src: "/anh2.jpg", caption: "Thành Cổ Loa — kinh đô nhà nước Âu Lạc" },
        ],
      },
    ],
  },

  4: {
    title: "Thời kỳ quân chủ (939 – 1945)",
    img: "/anh3.jpg",
    duration: "158h50p",
    description: "Hành trình ngàn năm độc lập tự chủ của các triều đại phong kiến Việt Nam từ Ngô Quyền đến triều Nguyễn.",
    chapters: [
      {
        id: 1,
        title: "Chương 1: Buổi đầu độc lập (939–1009)",
        duration: "30p",
        content: [
          { type: "heading", text: "1.1 Chiến thắng Bạch Đằng 938" },
          { type: "paragraph", text: "Năm 938, Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng, chấm dứt hơn 1.000 năm Bắc thuộc. Ông dùng kế cắm cọc nhọn bọc sắt xuống lòng sông, chờ khi thủy triều xuống mới ra nghênh chiến, đánh đắm toàn bộ thuyền chiến địch." },
          { type: "highlight", text: "Chiến thắng Bạch Đằng năm 938 được coi là \"bản tuyên ngôn độc lập bằng máu\" của dân tộc Việt Nam, mở ra kỷ nguyên tự chủ lâu dài." },
          { type: "heading", text: "1.2 Thời kỳ 12 sứ quân và thống nhất" },
          { type: "paragraph", text: "Sau khi Ngô Quyền mất (944), đất nước rơi vào loạn 12 sứ quân. Đinh Bộ Lĩnh dẹp loạn, thống nhất đất nước năm 968, lập ra nhà Đinh, đặt tên nước là Đại Cồ Việt, đóng đô tại Hoa Lư." },
          { type: "image", src: "/anh3.jpg", caption: "Sông Bạch Đằng — nơi diễn ra trận đánh lịch sử năm 938" },
        ],
      },
      {
        id: 2,
        title: "Chương 2: Đại Việt hưng thịnh (1009–1527)",
        duration: "60p",
        content: [
          { type: "heading", text: "2.1 Triều Lý và Văn Miếu Quốc Tử Giám" },
          { type: "paragraph", text: "Triều Lý (1009–1225) đánh dấu bước phát triển vượt bậc của đất nước. Năm 1010, Lý Thái Tổ dời đô từ Hoa Lư về Thăng Long. Năm 1070, Văn Miếu được xây dựng; năm 1076, Quốc Tử Giám — trường đại học đầu tiên của Việt Nam — được thành lập." },
          { type: "heading", text: "2.2 Ba lần kháng chiến chống Mông – Nguyên" },
          { type: "paragraph", text: "Dưới triều Trần, nhân dân Việt Nam ba lần đánh bại quân xâm lược Mông – Nguyên (1258, 1285, 1288). Chiến thắng Bạch Đằng năm 1288 dưới sự chỉ huy của Trần Quốc Tuấn (Hưng Đạo Vương) là một trong những trang sử hào hùng nhất." },
          { type: "highlight", text: "\"Đầu thần chưa rơi xuống đất, xin bệ hạ đừng lo\" — Trần Thủ Độ, thể hiện ý chí quyết chiến của triều đình và quân dân nhà Trần." },
          { type: "heading", text: "2.3 Khởi nghĩa Lam Sơn và nhà Lê" },
          { type: "paragraph", text: "Sau 20 năm bị nhà Minh đô hộ, Lê Lợi lãnh đạo khởi nghĩa Lam Sơn (1418–1427) giải phóng đất nước. Năm 1428, Lê Lợi lên ngôi hoàng đế, lập ra triều Lê sơ, mở ra thời kỳ phục hưng văn hóa với nhiều thành tựu rực rỡ." },
          { type: "image", src: "/anh3.jpg", caption: "Tượng đài Hưng Đạo Vương Trần Quốc Tuấn" },
        ],
      },
      {
        id: 3,
        title: "Chương 3: Giai đoạn cuối — Triều Nguyễn",
        duration: "50p",
        content: [
          { type: "heading", text: "3.1 Thành lập triều Nguyễn" },
          { type: "paragraph", text: "Năm 1802, Nguyễn Ánh thống nhất đất nước sau khi đánh bại triều Tây Sơn, lên ngôi hoàng đế, lấy niên hiệu Gia Long, đóng đô tại Huế. Triều Nguyễn là triều đại phong kiến cuối cùng trong lịch sử Việt Nam." },
          { type: "paragraph", text: "Triều Nguyễn xây dựng hệ thống hành chính thống nhất, ban hành Hoàng Việt luật lệ (Luật Gia Long), xây dựng Kinh thành Huế — một công trình kiến trúc đồ sộ được UNESCO công nhận là Di sản Văn hóa Thế giới." },
          { type: "highlight", text: "Năm 1945, Vua Bảo Đại tuyên bố thoái vị, kết thúc chế độ quân chủ phong kiến kéo dài hàng nghìn năm của Việt Nam." },
          { type: "image", src: "/anh3.jpg", caption: "Kinh thành Huế — Di sản Văn hóa Thế giới UNESCO" },
        ],
      },
    ],
  },

  5: {
    title: "Thời Bắc thuộc (180 TCN – 938)",
    img: "/anh4.jpg",
    duration: "158h50p",
    description: "Hơn 1.000 năm Bắc thuộc và những cuộc đấu tranh bất khuất của nhân dân Việt Nam để giành lại độc lập.",
    chapters: [
      {
        id: 1,
        title: "Chương 1: Ách đô hộ phương Bắc",
        duration: "40p",
        content: [
          { type: "heading", text: "1.1 Triệu Đà và sự khởi đầu Bắc thuộc" },
          { type: "paragraph", text: "Khoảng năm 179 TCN, Triệu Đà thôn tính Âu Lạc, sáp nhập vào Nam Việt. Đây được coi là mốc khởi đầu của thời kỳ Bắc thuộc kéo dài hơn 1.000 năm. Nhân dân Việt bị áp đặt thuế khóa nặng nề, bị bóc lột tài nguyên và cưỡng bức đồng hóa về văn hóa." },
          { type: "heading", text: "1.2 Chính sách đồng hóa" },
          { type: "paragraph", text: "Các triều đại phương Bắc (Hán, Đường...) thực hiện chính sách đồng hóa quyết liệt: áp đặt chữ Hán, Nho giáo, phong tục Trung Hoa; cưỡng bức di dân người Hán vào Việt Nam; tiêu diệt giới thống trị bản địa. Tuy nhiên, nhân dân Việt vẫn giữ được bản sắc văn hóa riêng." },
          { type: "highlight", text: "Dù bị đô hộ hơn 1.000 năm, người Việt vẫn bảo tồn được tiếng nói, phong tục tập quán, tín ngưỡng dân gian — minh chứng cho sức sống mãnh liệt của nền văn hóa dân tộc." },
          { type: "image", src: "/anh4.jpg", caption: "Di tích lịch sử thời kỳ Bắc thuộc" },
        ],
      },
      {
        id: 2,
        title: "Chương 2: Các cuộc khởi nghĩa",
        duration: "55p",
        content: [
          { type: "heading", text: "2.1 Khởi nghĩa Hai Bà Trưng (40–43 SCN)" },
          { type: "paragraph", text: "Năm 40 SCN, Trưng Trắc và Trưng Nhị phất cờ khởi nghĩa chống lại ách đô hộ của nhà Hán. Nghĩa quân nhanh chóng giải phóng 65 thành, Trưng Trắc xưng vương, đóng đô tại Mê Linh. Năm 43 SCN, quân Mã Viện đàn áp, hai bà nhảy xuống sông Hát Giang tuẫn tiết." },
          { type: "highlight", text: "Hai Bà Trưng là biểu tượng bất khuất của tinh thần chống ngoại xâm, được thờ phụng khắp đất nước với hơn 100 đền thờ tưởng niệm." },
          { type: "heading", text: "2.2 Khởi nghĩa Bà Triệu (248 SCN)" },
          { type: "paragraph", text: "Năm 248, Triệu Thị Trinh (Bà Triệu) lãnh đạo khởi nghĩa chống nhà Ngô. Bà nổi tiếng với câu nói: \"Tôi muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông, quét sạch bờ cõi để cứu dân ra khỏi nơi đắm đuối, chứ không thèm bắt chước người đời cúi đầu cong lưng làm tì thiếp cho người ta.\"" },
          { type: "heading", text: "2.3 Khởi nghĩa Lý Bí và nhà nước Vạn Xuân" },
          { type: "paragraph", text: "Năm 542, Lý Bí lãnh đạo khởi nghĩa, đánh đuổi quân Lương, lập ra nhà nước Vạn Xuân (544), xưng là Lý Nam Đế. Đây là nhà nước độc lập đầu tiên sau thời Âu Lạc, tồn tại được 60 năm trước khi bị nhà Tùy đàn áp." },
          { type: "image", src: "/anh4.jpg", caption: "Đền thờ Hai Bà Trưng tại Mê Linh, Hà Nội" },
        ],
      },
      {
        id: 3,
        title: "Chương 3: Kết thúc Bắc thuộc",
        duration: "30p",
        content: [
          { type: "heading", text: "3.1 Khúc Thừa Dụ và tự chủ" },
          { type: "paragraph", text: "Năm 905, Khúc Thừa Dụ nắm quyền tự trị, mở đầu thời kỳ tự chủ trước khi giành độc lập hoàn toàn. Họ Khúc thực hiện nhiều cải cách hành chính, giảm nhẹ thuế khóa, tạo nền tảng cho nền độc lập sau này." },
          { type: "heading", text: "3.2 Dương Đình Nghệ và Ngô Quyền" },
          { type: "paragraph", text: "Năm 931, Dương Đình Nghệ đánh đuổi quân Nam Hán, giữ vững nền tự chủ. Năm 938, Ngô Quyền — con rể Dương Đình Nghệ — đánh tan quân Nam Hán trên sông Bạch Đằng, chính thức chấm dứt 1.000 năm Bắc thuộc." },
          { type: "highlight", text: "Năm 938, Ngô Quyền với chiến thắng Bạch Đằng đã chính thức chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập lâu dài của dân tộc Việt Nam." },
          { type: "image", src: "/anh4.jpg", caption: "Tượng đài Ngô Quyền tại khu di tích Bạch Đằng" },
        ],
      },
    ],
  },

  6: {
    title: "Thời kỳ hiện đại (1858 – nay)",
    img: "/anh5.jpg",
    duration: "158h50p",
    description: "Lịch sử Việt Nam từ khi thực dân Pháp xâm lược đến công cuộc Đổi mới và hội nhập quốc tế.",
    chapters: [
      {
        id: 1,
        title: "Chương 1: Pháp xâm lược và phong trào yêu nước",
        duration: "50p",
        content: [
          { type: "heading", text: "1.1 Pháp tấn công Đà Nẵng 1858" },
          { type: "paragraph", text: "Ngày 1/9/1858, liên quân Pháp – Tây Ban Nha tấn công Đà Nẵng, mở đầu quá trình xâm lược Việt Nam. Triều đình Nguyễn với chính sách cầu hòa và bảo thủ đã không thể bảo vệ đất nước, dần nhượng bộ ký các hiệp ước bất bình đẳng." },
          { type: "paragraph", text: "Hiệp ước Patenôtre 1884 chính thức đặt Việt Nam dưới sự bảo hộ của Pháp. Đất nước bị chia thành 3 kỳ: Nam Kỳ (thuộc địa), Trung Kỳ và Bắc Kỳ (bảo hộ) với các chế độ cai trị khác nhau." },
          { type: "heading", text: "1.2 Phong trào Đông Du và Duy Tân" },
          { type: "paragraph", text: "Đầu thế kỷ XX, các phong trào yêu nước theo xu hướng mới xuất hiện. Phan Bội Châu lãnh đạo phong trào Đông Du, đưa thanh niên sang Nhật học tập. Phan Châu Trinh chủ trương Duy Tân, cải cách từ bên trong, khai dân trí, chấn dân khí, hậu dân sinh." },
          { type: "image", src: "/anh5.jpg", caption: "Phong trào yêu nước đầu thế kỷ XX" },
        ],
      },
      {
        id: 2,
        title: "Chương 2: Cách mạng tháng Tám 1945",
        duration: "45p",
        content: [
          { type: "heading", text: "2.1 Đảng Cộng sản Việt Nam ra đời" },
          { type: "paragraph", text: "Ngày 3/2/1930, Đảng Cộng sản Việt Nam được thành lập tại Hương Cảng (Hồng Kông) dưới sự chủ trì của Nguyễn Ái Quốc (Hồ Chí Minh). Sự ra đời của Đảng đánh dấu bước ngoặt lịch sử của cách mạng Việt Nam, chấm dứt tình trạng khủng hoảng về đường lối." },
          { type: "heading", text: "2.2 Tổng khởi nghĩa tháng Tám" },
          { type: "paragraph", text: "Tháng 8/1945, khi Nhật đầu hàng Đồng Minh, Đảng phát lệnh Tổng khởi nghĩa. Chỉ trong vòng 15 ngày (14–28/8/1945), cách mạng thành công trên cả nước. Ngày 2/9/1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa." },
          { type: "highlight", text: "\"Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được...\" — Trích Tuyên ngôn Độc lập 2/9/1945" },
          { type: "image", src: "/anh5.jpg", caption: "Quảng trường Ba Đình ngày 2/9/1945 — Ngày Độc lập" },
        ],
      },
      {
        id: 3,
        title: "Chương 3: Đổi mới và hội nhập",
        duration: "40p",
        content: [
          { type: "heading", text: "3.1 Công cuộc Đổi mới 1986" },
          { type: "paragraph", text: "Đại hội Đảng lần thứ VI (1986) khởi xướng công cuộc Đổi mới toàn diện, chuyển từ nền kinh tế kế hoạch hóa tập trung sang kinh tế thị trường định hướng xã hội chủ nghĩa. Đây là quyết sách lịch sử giúp Việt Nam thoát khỏi khủng hoảng kinh tế – xã hội nghiêm trọng." },
          { type: "paragraph", text: "Sau Đổi mới, kinh tế Việt Nam tăng trưởng mạnh mẽ. Từ một nước nghèo, Việt Nam trở thành nước có thu nhập trung bình thấp. Tỷ lệ nghèo giảm từ hơn 70% (1986) xuống còn khoảng 4% (2023)." },
          { type: "highlight", text: "Năm 1995, Việt Nam bình thường hóa quan hệ với Mỹ và gia nhập ASEAN, mở ra kỷ nguyên hội nhập quốc tế sâu rộng." },
          { type: "heading", text: "3.2 Việt Nam trong thế kỷ XXI" },
          { type: "paragraph", text: "Việt Nam gia nhập WTO năm 2007, ký kết nhiều hiệp định thương mại tự do quan trọng như CPTPP, EVFTA. Nền kinh tế liên tục tăng trưởng, GDP bình quân đầu người tăng gấp nhiều lần, đời sống nhân dân không ngừng được cải thiện." },
          { type: "image", src: "/anh5.jpg", caption: "Việt Nam hội nhập và phát triển trong thế kỷ XXI" },
        ],
      },
    ],
  },
};

// ============ ICONS ============
function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ============ RENDER CONTENT ============
function RenderContent({ block }) {
  if (block.type === "heading") {
    return <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">{block.text}</h3>;
  }
  if (block.type === "paragraph") {
    return <p className="text-sm text-gray-700 leading-relaxed mb-3">{block.text}</p>;
  }
  if (block.type === "highlight") {
    return (
      <div className="bg-orange-50 border-l-4 border-[#F26739] px-4 py-3 rounded-r-xl mb-3">
        <p className="text-sm text-orange-800 italic leading-relaxed">{block.text}</p>
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div className="my-4">
        <img src={block.src} alt={block.caption} className="w-full rounded-xl object-cover max-h-64" />
        {block.caption && <p className="text-xs text-gray-400 text-center mt-1">{block.caption}</p>}
      </div>
    );
  }
  return null;
}

// ============ COMPLETION MODAL ============
function CompletionModal({ title, onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[320px] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-800 mb-1">Hoàn thành!</p>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Bạn đã hoàn thành bài giảng<br />
          <span className="font-medium text-gray-600">"{title}"</span>
        </p>
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-[#F26739] text-white text-sm font-semibold hover:bg-orange-600 transition"
        >
          Quay về danh sách tài liệu
        </button>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function BaiGiangPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const docId = Number(id);
  const data = documentsData[docId] ?? documentsData[1];
  const doc = location.state?.doc ?? null;

  const [activeChapter, setActiveChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentChapter = data.chapters[activeChapter];
  const progress = Math.round((completedChapters.length / data.chapters.length) * 100);
  const isLastChapter = activeChapter === data.chapters.length - 1;

  const handleComplete = () => {
    if (!completedChapters.includes(activeChapter)) {
      setCompletedChapters((prev) => [...prev, activeChapter]);
    }
    if (isLastChapter) {
      setShowCompletionModal(true);
    } else {
      setActiveChapter((prev) => prev + 1);
    }
  };

  // ✅ Click "Bài Giảng" → về DocumentsDetailPage
  const handleBreadcrumbClick = () => {
    navigate(`/teacher/documents/${id}`, { state: { doc, activeTab: "Thông tin" } });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <IconBack /> Trở về
          </button>

          <span className="text-gray-300">|</span>

          {/* ✅ "Bài Giảng" — click được, về DocumentsDetailPage */}
          <button
            onClick={handleBreadcrumbClick}
            className="text-sm text-gray-400 hover:text-[#F26739] hover:underline transition-colors"
          >
            Bài Giảng
          </button>

          <span className="text-gray-300">/</span>

          <span className="text-sm font-medium text-gray-700 line-clamp-1 max-w-xs">
            {data.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F26739] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{progress}%</span>
          </div>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition"
          >
            {sidebarOpen ? "Ẩn mục lục" : "Hiện mục lục"}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <img src={data.img} alt={data.title} className="w-full h-28 object-cover rounded-xl mb-3" />
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">{data.title}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <IconClock /> {data.duration} · {data.chapters.length} chương
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {data.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    activeChapter === idx ? "bg-orange-50 border border-orange-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    completedChapters.includes(idx) ? "bg-green-500 text-white"
                    : activeChapter === idx ? "bg-[#F26739] text-white"
                    : "bg-gray-100 text-gray-400"
                  }`}>
                    {completedChapters.includes(idx)
                      ? <IconCheck />
                      : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium line-clamp-2 ${activeChapter === idx ? "text-[#F26739]" : "text-gray-700"}`}>
                      {ch.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <IconClock /> {ch.duration}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <div className="mb-6">
              <span className="text-xs font-medium text-[#F26739] bg-orange-50 px-2.5 py-1 rounded-full">
                Chương {activeChapter + 1} / {data.chapters.length}
              </span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">{currentChapter.title}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <IconClock /> Thời lượng: {currentChapter.duration}
              </p>
            </div>

            <div className="border-t border-gray-100 mb-6" />

            <div>
              {currentChapter.content.map((block, i) => (
                <RenderContent key={i} block={block} />
              ))}
            </div>

            {/* Footer navigation */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setActiveChapter((p) => Math.max(0, p - 1))}
                disabled={activeChapter === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
              >
                <IconBack /> Chương trước
              </button>

              <button
                onClick={handleComplete}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  completedChapters.includes(activeChapter) && !isLastChapter
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-[#F26739] text-white hover:bg-orange-600"
                }`}
              >
                {completedChapters.includes(activeChapter) && !isLastChapter
                  ? <><IconCheck /> Đã hoàn thành</>
                  : isLastChapter
                  ? "Hoàn thành bài giảng ✓"
                  : "Hoàn thành & Tiếp theo →"
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <CompletionModal
          title={data.title}
          onBack={() => navigate("/teacher/documents")}
        />
      )}
    </div>
  );
}