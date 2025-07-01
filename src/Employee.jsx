import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./Employee.css";

const responseOptions = ["Interested", "Not Interested", "Call Later", "Wrong Number", "Other"];
const LOCAL_STORAGE_KEY = "employeeCallData";

const saveToLocalStorage = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const loadFromLocalStorage = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

function Employee() {
  const [data, setData] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [empDetails, setEmpDetails] = useState(null);
  const [genderFilter, setGenderFilter] = useState("");
  const [responseFilter, setResponseFilter] = useState("");
  const logDocIdRef = useRef(null);

  // Save call work data to Firestore in batch
  const saveWorkToFirestore = async (empId, workData) => {
    const callsCollection = collection(db, "employeeWork", empId, "calls");
    const snapshot = await getDocs(callsCollection);

    const existingDocs = {};
    snapshot.docs.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.contact) {
        existingDocs[d.contact] = { ...d, _docId: docSnap.id };
      }
    });

    const batch = writeBatch(db);

    workData.forEach((row) => {
      const updatedDoc = {
        id: Number(row.id) || 0,
        name: row.name || "",
        gender: row.gender || "",
        city: row.city || "",
        contact: row.contact || "",
        callTime: row.callTime || "",
        response: row.response || "",
      };

      if (existingDocs[row.contact]) {
        batch.update(
          doc(db, "employeeWork", empId, "calls", existingDocs[row.contact]._docId),
          updatedDoc
        );
      } else {
        const newDocRef = doc(collection(db, "employeeWork", empId, "calls"));
        batch.set(newDocRef, updatedDoc);
      }
    });

    await batch.commit();
  };

  // Load call work data from Firestore
  const loadWorkFromFirestore = async (empId) => {
    try {
      const snapshot = await getDocs(collection(db, "employeeWork", empId, "calls"));
      const work = snapshot.docs
        .map((doc, index) => {
          const data = doc.data();
          return {
            id: Number(data.id) || index + 1,
            name: data.name || "",
            gender: data.gender || "",
            city: data.city || "",
            contact: data.contact || "",
            callTime: data.callTime || "",
            response: data.response || "",
          };
        })
        .sort((a, b) => a.id - b.id);

      setData(work);
      saveToLocalStorage(work);
    } catch (err) {
      console.error("Failed to load work data:", err);
      setData([]);
    }
  };

  // Auto-login from local storage
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("employeeLoggedIn") === "true";
    const details = localStorage.getItem("employeeDetails");

    if (isLoggedIn && details) {
      const parsedDetails = JSON.parse(details);
      setLoggedIn(true);
      setEmpDetails(parsedDetails);
      loadWorkFromFirestore(parsedDetails.id);
    }
  }, []);

  // Employee login
  const handleLogin = async () => {
    try {
      const snapshot = await getDocs(collection(db, "employees"));
      const employees = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const found = employees.find(
        (emp) => emp.username === username && emp.password === password
      );

      if (found) {
        setLoggedIn(true);
        setEmpDetails(found);
        setLoginError("");

        localStorage.setItem("employeeLoggedIn", "true");
        localStorage.setItem("employeeDetails", JSON.stringify(found));

        const logDoc = await addDoc(collection(db, "loginLogs"), {
          empId: found.id,
          name: found.name,
          loginTime: Timestamp.fromDate(new Date()),
          logoutTime: null,
        });

        logDocIdRef.current = logDoc.id;
        await loadWorkFromFirestore(found.id);
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Error connecting to database.");
    }
  };

  const handleLogout = async () => {
    if (empDetails && logDocIdRef.current) {
      try {
        await updateDoc(doc(db, "loginLogs", logDocIdRef.current), {
          logoutTime: Timestamp.fromDate(new Date()),
        });
      } catch (err) {
        console.error("Failed to update logout time:", err);
      }
    }

    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setEmpDetails(null);
    localStorage.removeItem("employeeLoggedIn");
    localStorage.removeItem("employeeDetails");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !empDetails) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const newData = jsonData.map((row, index) => ({
          id: index + 1,
          name: row.name || "",
          gender: row.gender || "",
          city: row.city || "",
          contact: row.contact || "",
          callTime: row.callTime || "",
          response: row.response || "",
        }));

        setData(newData);
        saveToLocalStorage(newData);
        await saveWorkToFirestore(empDetails.id, newData);
        alert("File uploaded and saved successfully.");
      } catch (err) {
        console.error("Failed to read or save Excel file:", err);
        alert("Error uploading the file.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleCallClick = async (index) => {
    const updated = [...data];
    updated[index].callTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    setData(updated);
    saveToLocalStorage(updated);
    await saveWorkToFirestore(empDetails.id, updated);

    try {
      await navigator.clipboard.writeText(updated[index].contact);
      alert("Contact copied to clipboard.");
    } catch {
      alert("Failed to copy contact.");
    }
  };

  const handleResponseChange = async (index, value) => {
    const updated = [...data];
    updated[index].response = value;
    setData(updated);
    saveToLocalStorage(updated);
    await saveWorkToFirestore(empDetails.id, updated);
  };

  const handleCustomResponseChange = async (index, value) => {
    const updated = [...data];
    updated[index].response = value;
    setData(updated);
    saveToLocalStorage(updated);
    await saveWorkToFirestore(empDetails.id, updated);
  };

  const handleUpdateRow = async (index) => {
    const row = data[index];
    const name = prompt("Update Name:", row.name) || row.name;
    const gender = prompt("Update Gender:", row.gender) || row.gender;
    const city = prompt("Update City:", row.city) || row.city;
    const contact = prompt("Update Contact:", row.contact) || row.contact;

    const updated = [...data];
    updated[index] = { ...row, name, gender, city, contact };
    setData(updated);
    saveToLocalStorage(updated);
    await saveWorkToFirestore(empDetails.id, updated);
  };

  const exportToExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calls");
    XLSX.writeFile(wb, "call_data.xlsx");
  };

  const cleanData = async () => {
    if (!empDetails) return;
    const confirmed = window.confirm("This will export and delete all current work. Proceed?");
    if (!confirmed) return;

    exportToExcel();

    try {
      const callsSnapshot = await getDocs(collection(db, "employeeWork", empDetails.id, "calls"));
      const deletions = callsSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "employeeWork", empDetails.id, "calls", docSnap.id))
      );
      await Promise.all(deletions);
    } catch (err) {
      console.error("Failed to clean data:", err);
      alert("Error cleaning data.");
      return;
    }

    setData([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    alert("Data cleaned successfully. You can now upload a new file.");
  };

  // Filter data
  const filteredData = data.filter(
    (row) =>
      (!genderFilter || row.gender === genderFilter) &&
      (!responseFilter || row.response === responseFilter)
  );

  if (!loggedIn) {
    return (
      <div className="login-container">
        <h2 className="login-title">Employee Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {loginError && <p className="login-error">{loginError}</p>}
      </div>
    );
  }

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h1>Employee Call Portal</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="filters">
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select value={responseFilter} onChange={(e) => setResponseFilter(e.target.value)}>
          <option value="">All Responses</option>
          {responseOptions.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      <div className="table-wrapper">
        <table className="call-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Gender</th><th>City</th><th>Contact</th>
              <th>Call</th><th>Call Time</th><th>Response</th><th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.gender}</td>
                <td>{row.city}</td>
                <td>{row.contact}</td>
                <td><button onClick={() => handleCallClick(index)}>Call</button></td>
                <td>{row.callTime}</td>
                <td>
                  <select
                    value={responseOptions.includes(row.response) ? row.response : "Other"}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                  >
                    <option value="">Select</option>
                    {responseOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {row.response && !responseOptions.includes(row.response) && (
                    <input
                      type="text"
                      value={row.response}
                      onChange={(e) => handleCustomResponseChange(index, e.target.value)}
                    />
                  )}
                </td>
                <td><button onClick={() => handleUpdateRow(index)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="export-section">
        <button onClick={exportToExcel}>Export to Excel</button>
        <button onClick={cleanData}>Clean Data</button>
      </div>
    </div>
  );
}

export default Employee;
