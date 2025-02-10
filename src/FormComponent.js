import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [outputFileName, setOutputFileName] = useState("");

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleDownload = async () => {
    const formData = new FormData();
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("Context_param", selectedFiles[i]);
      }
    }
    formData.append("Content_param", outputFileName || "extracted_text.pdf");

    try {
      const response = await axios.post("http://localhost:5000/extract-text", formData, {
        responseType: "blob", // Ensures the response is treated as a file
      });

      // Create a download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = outputFileName || "extracted_text.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error extracting text:", error);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} accept=".pdf" />
      <input 
        type="text" 
        placeholder="Output file name (e.g., output.pdf)" 
        value={outputFileName} 
        onChange={(e) => setOutputFileName(e.target.value)} 
      />
      <button onClick={handleDownload}>Extract & Download</button>
    </div>
  );
};

export default FileUpload;
