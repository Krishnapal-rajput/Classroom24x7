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

const responseOptions = ["Interested", "Not Interested", "Call Later", "Wrong Number"];
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

  // Save work data to Firestore
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

  // Load work from Firestore
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

  // Login
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

        const localData = loadFromLocalStorage();
        if (localData.length > 0) {
          setData(localData);
        } else {
          await loadWorkFromFirestore(found.id);
        }
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Error connecting to database.");
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("employeeLoggedIn") === "true";
    const details = localStorage.getItem("employeeDetails");

    if (isLoggedIn && details) {
      const parsedDetails = JSON.parse(details);
      setLoggedIn(true);
      setEmpDetails(parsedDetails);

      const localData = loadFromLocalStorage();
      if (localData.length > 0) {
        setData(localData);
      } else {
        loadWorkFromFirestore(parsedDetails.id);
      }
    }
  }, []);

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
    setData([]);
    logDocIdRef.current = null;
    localStorage.removeItem("employeeLoggedIn");
    localStorage.removeItem("employeeDetails");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tel:${updated[index].contact}`;
    } else {
      try {
        await navigator.clipboard.writeText(updated[index].contact);
        alert("Contact copied to clipboard.");
      } catch {
        alert("Failed to copy contact.");
      }
    }
  };

  const handleResponseChange = async (index, value) => {
    const updated = [...data];
    updated[index].response = value;
    setData(updated);
    saveToLocalStorage(updated);
    await saveWorkToFirestore(empDetails.id, updated);
  };

  const handleEdit = async (index) => {
    const updated = [...data];
    const name = prompt("Edit Name", updated[index].name);
    const gender = prompt("Edit Gender", updated[index].gender);
    const city = prompt("Edit City", updated[index].city);
    const contact = prompt("Edit Contact", updated[index].contact);
    if (name !== null) updated[index].name = name;
    if (gender !== null) updated[index].gender = gender;
    if (city !== null) updated[index].city = city;
    if (contact !== null) updated[index].contact = contact;

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

      setData([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      alert("Data cleaned successfully. You can now upload a new file.");
    } catch (err) {
      console.error("Failed to clean data:", err);
      alert("Error cleaning data.");
    }
  };

  const filteredData = data.filter(
    (row) =>
      (!genderFilter || row.gender.toLowerCase() === genderFilter.toLowerCase()) &&
      (!responseFilter || row.response.toLowerCase().includes(responseFilter.toLowerCase()))
  );

  if (!loggedIn) {
    return (
      <div className="login-container">
        <h2 className="login-title">Employee Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button onClick={handleLogin} className="login-button">
          Login
        </button>
        {loginError && <p className="login-error">{loginError}</p>}
      </div>
    );
  }

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h1 className="portal-title">Employee Call Portal</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <p className="welcome-message">Welcome, {empDetails?.name}</p>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="file-input" />

      {data.length > 0 && (
        <>
          <div className="table-wrapper">
            <table className="call-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </th>
                  <th>City</th>
                  <th>Contact</th>
                  <th>Call</th>
                  <th>Call Time</th>
                  <th>Response
                    <input
                      type="text"
                      value={responseFilter}
                      onChange={(e) => setResponseFilter(e.target.value)}
                      className="filter-input"
                      placeholder="Filter"
                    />
                  </th>
                  <th>Edit</th>
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
                    <td>
                      <button onClick={() => handleCallClick(index)} className="call-button">
                        Call
                      </button>
                    </td>
                    <td>{row.callTime}</td>
                    <td>
                      <input
                        list="responseOptions"
                        value={row.response || ""}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        className="response-select"
                        placeholder="Type or select"
                      />
                      <datalist id="responseOptions">
                        {responseOptions.map((opt, i) => (
                          <option key={i} value={opt} />
                        ))}
                      </datalist>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(index)} className="edit-button">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="export-section">
            <button onClick={exportToExcel} className="export-button">Export to Excel</button>
            <button onClick={cleanData} className="clean-button">Clean Data</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Employee;
