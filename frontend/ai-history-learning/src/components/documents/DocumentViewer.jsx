import React from "react";

const DocumentViewer = ({ fileUrl, title }) => {
	return (
		<div className="flex-1 overflow-hidden bg-[#525659] flex items-stretch">
			{fileUrl ? (
				<iframe
					src={`${fileUrl}#toolbar=1&navpanes=1&view=FitH&zoom=60&sidebarsize=120`}
					allow="fullscreen"
					style={{
						width: "100%",
						height: "100%",
						border: "none",
						display: "block",
					}}
					title={title}
				/>
			) : (
				<div
					style={{
						color: "#aaa",
						fontSize: "14px",
						textAlign: "center",
						margin: "auto",
					}}
				>
					Không tìm thấy file PDF gốc.
				</div>
			)}
		</div>
	);
};

export default DocumentViewer;
