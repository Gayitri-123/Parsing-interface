import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import logo from "./anika logo.jpg";


// Login Component
const Login = ({ onLogin, onShowSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Retrieve the stored user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Log for debugging purposes
    console.log("Stored user:", storedUser);
    console.log("Entered email:", email);
    console.log("Entered password:", password);

    // Check if storedUser exists before accessing its properties
    if (storedUser && storedUser.email && storedUser.password) {
      if (
        storedUser.email.toLowerCase() === email.toLowerCase() &&
        storedUser.password === password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        onLogin(true); // Successfully logged in
      } else {
        alert("Invalid credentials!");
      }
    } else {
      alert("No user found! Please sign up first.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?{" "}
        <span onClick={() => onShowSignup(true)}>Sign Up</span>
      </p>
    </div>
  );
};


// Signup Component
const Signup = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    const newUser = { email, password };
    localStorage.setItem("user", JSON.stringify(newUser));
    alert("Signup successful! Please log in.");
    onSignup(false); // Switch back to login after successful signup
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account?{" "}
        <span onClick={() => onSignup(false)}>Login</span>
      </p>
    </div>
  );
};

// Data Fetching Component
const DataFetchingComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.example.com/data");
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Fetched Data</h1>
      <ul>{data.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
    </div>
  );
};

// Uploading Tab Component (Updated)
const UploadingTab = ({ files }) => {
  return (
    <div>
      <h2>Uploading Tab</h2>
      <div className="container">
        {["docs", "pdfs", "scannedPdfs"].map((type) => (
          <div className="box" key={type}>
            <h3>{type.toUpperCase()} Files</h3>
            <div className="file-box">
              <ul>
                {files[type].map((file, index) => (
                  <li key={index}>
                    <strong>{file.name}</strong>
                    <div className="file-details">
                      <p><strong>Embeddings:</strong> {file.embeddings}</p>
                      <p><strong>Chunks:</strong> {file.chunks}</p>
                      <p><strong>Vectors:</strong> {file.vectors}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// App Component (Updated)
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [files, setFiles] = useState({ docs: [], pdfs: [], scannedPdfs: [] });
  const [pendingFiles, setPendingFiles] = useState({ docs: [], pdfs: [], scannedPdfs: [] });
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || { docs: [], pdfs: [], scannedPdfs: [] };
    setFiles(storedFiles);
  }, []);

  const generateFileData = (fileName) => ({
    embeddings: `Embeddings for ${fileName}`,
    chunks: `Chunks for ${fileName}`,
    vectors: `Vectors for ${fileName}`,
  });

  const handleFileSelection = (event, type) => {
    const uploadedFiles = Array.from(event.target.files);
    setPendingFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...uploadedFiles.map((file) => ({ name: file.name, ...generateFileData(file.name) }))],
    }));
  };

  const handleSubmitFiles = async () => {
    const updatedFiles = {
      docs: [...files.docs, ...pendingFiles.docs],
      pdfs: [...files.pdfs, ...pendingFiles.pdfs],
      scannedPdfs: [...files.scannedPdfs, ...pendingFiles.scannedPdfs],
    };

    setFiles(updatedFiles);
    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
    setPendingFiles({ docs: [], pdfs: [], scannedPdfs: [] });

    try {
      const response = await axios.post("http://localhost:3001/api/forma", updatedFiles);
      alert("Files submitted successfully!");
      setApiResponse(response.data); // Save API response to state
    } catch (error) {
      console.error("Error submitting files:", error);
      setApiResponse({ error: "Failed to submit files!" }); // Handle errors
    }
  };

  const renderApiResponse = () => {
    if (apiResponse === null) {
      return null;
    }
    if (apiResponse.error) {
      return <div className="error">{apiResponse.error}</div>;
    }
    return (
      <div className="api-response">
        <h3>API Response:</h3>
        <pre>{JSON.stringify(apiResponse, null, 2)}</pre> {/* Format response data */}
      </div>
    );
  };

  const Home = () => (
    <div>
      <header>
        <img src={logo} alt="Anika Global Solution" className="logo" />
        <h1>Anika Global Solution</h1>
      </header>
      <div className="container">
        {["docs", "pdfs", "scannedPdfs"].map((type) => (
          <div className="box" key={type}>
            <h3>Upload {type.toUpperCase()} Files</h3>
            <input
              type="file"
              accept={type === "docs" ? ".doc,.docx" : ".pdf"}
              multiple
              onChange={(e) => handleFileSelection(e, type)}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSubmitFiles} className="submit-btn">
        Submit Files
      </button>
      {renderApiResponse()} {/* Output panel for showing API response */}
      <div className="file-display">
        <h2>Uploaded Files</h2>
        {Object.keys(files).map((type) => (
          <div key={type}>
            <h4>{type.toUpperCase()} Files:</h4>
            <ul>{files[type].map((file, index) => <li key={index}>{file.name}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );

  const Chatbot = () => {
    const [input, setInput] = useState("");

    const handleSendMessage = async () => {
      if (!input.trim()) return;
      try {
        const res = await axios.post("http://192.168.0.103:6002/api/chatbot", { message: input });
        console.log("Chatbot response:", res.data);
      } catch (error) {
        console.error("Chatbot error:", error);
      }
      setInput("");
    };

    return (
      <div>
        <h2>Chatbot</h2>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return <Home />;
      case "uploading":
        return <UploadingTab files={files} />; // Show the files, embeddings, chunks, and vectors on the uploading tab
      case "chatbot":
        return <Chatbot />;
      case "Fetching":
        return <DataFetchingComponent />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <nav>
            <ul>
              {["Home", "uploading", "chatbot", "Fetching"].map((tab) => (
                <li
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </li>
              ))}
              <li
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </li>
            </ul>
          </nav>
          {renderTabContent()}
        </>
      ) : showSignup ? (
        <Signup onSignup={setShowSignup} />
      ) : (
        <Login onLogin={setIsLoggedIn} onShowSignup={setShowSignup} />
      )}
    </div>
  );
};

export default App;

