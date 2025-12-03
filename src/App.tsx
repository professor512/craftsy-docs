// src/App.tsx
import React from "react";
import DocumentEditor from "./components/DocumentEditor";

const App: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: 0 }}>
      <DocumentEditor />
    </div>
  );
};

export default App;
