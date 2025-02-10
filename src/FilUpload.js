import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a PDF file to upload.");
      
      return;
    }

    const formData = new FormData();
    formData.append("Context_param", selectedFile);
    formData.append("Content_param", "extracted_text.pdf"); // Output PDF file name

    try {
      const response = await axios.post("http://127.0.0.1:6002/application/document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponseMessage(response.data.message);
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponseMessage("Failed to extract text from PDF.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Upload PDF for Text Extraction</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">Submit</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};
export default FileUpload;
