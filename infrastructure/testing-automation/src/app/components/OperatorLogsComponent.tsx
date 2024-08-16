"use client";

import { useState } from "react";
import JSZip from "jszip";

export default function OperatorLogsComponent() {
  const [logs, setLogs] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/read-logs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          "Failed to fetch logs. This wallet hasn't operated any runs."
        );
      }
      const data = await response.json();
      setLogs(data.cleanedLogs.replace(/\n/g, "<br/>"));
    } catch (error: any) {
      console.log("Could not fetch logs");
      setLogs("No files found. Probably this wallet hasn't operated any runs.");
    }
  };

  const downloadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/download-logs`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Convert response to a blob
      const blob = await response.blob();

      const zip = await JSZip.loadAsync(blob);

      const fileNames: any = [];
      zip.forEach((relativePath, file) => {
        if (!file.dir) fileNames.push(relativePath);
      });

      setFiles(fileNames);
    } catch (error) {
      console.error("Error fetching ZIP contents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async (fileName: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/download-logs");
      if (!response.ok) throw new Error("Failed to download ZIP file");

      const blob = await response.blob();
      const zip = await JSZip.loadAsync(blob);
      const file = zip.file(fileName);

      if (file) {
        const fileBlob = await file.async("blob");
        const newZip = new JSZip();
        newZip.file(fileName, fileBlob);

        const newZipBlob = await newZip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(newZipBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Operator Logs</h1>
      <br />
      <button onClick={() => downloadLogs()}>Download logs</button>
      <button onClick={() => fetchLogs()}>Get logs</button>
      {files.length > 0 && !loading && (
        <ul style={{ margin: "10px" }}>
          {files.map((file) => (
            <li key={file} style={{ marginTop: "10px" }}>
              {file}{" "}
              <button onClick={() => handleFileDownload(file)}>Download</button>
            </li>
          ))}
        </ul>
      )}
      {loading && <p style={{ color: "blue" }}>Loading...</p>}
      {logs && <div dangerouslySetInnerHTML={{ __html: logs }} />}
    </div>
  );
}
