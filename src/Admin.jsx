import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import "./Admin.css";

const AdminPanel = () => {
  const [userData, setUserData] = useState([]);
  const [employeeLogs, setEmployeeLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newEmp, setNewEmp] = useState({
    name: "",
    username: "",
    password: "",
  });

  // Fetch user data, employees, and login logs on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "userData"));
        const users = querySnapshot.docs.map((doc, idx) => {
          const data = doc.data();
          return {
            id: idx + 1,
            name: data.name || "",
            contact: data.contact || "",
            gender: data.gender || "",
            createdAt: data.createdAt?.toDate?.() || null,
          };
        });
        setUserData(users);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const snapshot = await getDocs(collection(db, "employees"));
        const empList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(empList);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    const fetchEmployeeLogs = async () => {
      try {
        const logsRef = collection(db, "loginLogs");
        const snapshot = await getDocs(logsRef);

        const logs = snapshot.docs.map((doc) => {
          const data = doc.data();

          const loginTime =
            data.loginTime instanceof Timestamp
              ? data.loginTime.toDate().toLocaleString()
              : data.loginTime
              ? new Date(data.loginTime).toLocaleString()
              : "N/A";

          const logoutTime =
            data.logoutTime instanceof Timestamp
              ? data.logoutTime.toDate().toLocaleString()
              : data.logoutTime
              ? new Date(data.logoutTime).toLocaleString()
              : "N/A";

          return {
            empId: data.empId || "Unknown",
            name: data.name || "Unknown",
            loginTime,
            logoutTime,
          };
        });

        setEmployeeLogs(logs);
      } catch (err) {
        console.error("Failed to fetch employee logs:", err);
        setEmployeeLogs([]);
      }
    };

    fetchUserData();
    fetchEmployees();
    fetchEmployeeLogs();
  }, []);

  // Export any JSON array data to Excel file
  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // Add a new employee
  const handleAddEmployee = async () => {
    try {
      const { name, username, password } = newEmp;
      if (!name || !username || !password) {
        alert("Please fill in all fields.");
        return;
      }

      const snapshot = await getDocs(collection(db, "employees"));
      const count = snapshot.docs.length;
      const nextId = `EMP${String(count + 1).padStart(2, "0")}`;

      await setDoc(doc(db, "employees", nextId), {
        empId: nextId,
        name,
        username,
        password,
      });

      setNewEmp({ name: "", username: "", password: "" });
      const empList = (await getDocs(collection(db, "employees"))).docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );
      setEmployees(empList);
    } catch (err) {
      console.error("Failed to add employee:", err);
    }
  };

  // Update employee data
  const handleUpdateEmployee = async (id, updatedData) => {
    try {
      const empRef = doc(db, "employees", id);
      await updateDoc(empRef, updatedData);
      const snapshot = await getDocs(collection(db, "employees"));
      const empList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(empList);
    } catch (err) {
      console.error("Failed to update employee:", err);
    }
  };

  // Delete employee by id
  const handleDeleteEmployee = async (id) => {
    try {
      await deleteDoc(doc(db, "employees", id));
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error("Failed to delete employee:", err);
    }
  };

  // Fix incorrect login/logout timestamps by converting them to Firestore Timestamp
  const cleanLoginLogs = async () => {
    try {
      const logsRef = collection(db, "loginLogs");
      const snapshot = await getDocs(logsRef);

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const updates = {};

        if (data.loginTime && !(data.loginTime instanceof Timestamp)) {
          const parsed = new Date(data.loginTime);
          if (!isNaN(parsed)) updates.loginTime = Timestamp.fromDate(parsed);
        }

        if (data.logoutTime && !(data.logoutTime instanceof Timestamp)) {
          const parsed = new Date(data.logoutTime);
          if (!isNaN(parsed)) updates.logoutTime = Timestamp.fromDate(parsed);
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, "loginLogs", docSnap.id), updates);
        }
      }

      alert("Login logs cleaned successfully.");
    } catch (err) {
      console.error("Error cleaning login logs:", err);
    }
  };

  // Delete all login logs with confirmation
  const resetLoginLogs = async () => {
    const confirmReset = window.confirm(
      "⚠️ This action will permanently delete all employee login logs. Do you want to continue?"
    );

    if (!confirmReset) return;

    try {
      const logsRef = collection(db, "loginLogs");
      const snapshot = await getDocs(logsRef);

      const deletions = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "loginLogs", docSnap.id))
      );

      await Promise.all(deletions);
      setEmployeeLogs([]);
      alert("All login logs have been deleted successfully.");
    } catch (err) {
      console.error("Failed to reset login logs:", err);
    }
  };

  // Admin logout function
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">Admin Dashboard</h2>
        <button className="export-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* User Data Section */}
      <div className="section">
        <div className="section-header">
          <h3>User Inquiries</h3>
          <button
            className="export-btn"
            onClick={() => exportToExcel(userData, "UserInquiries")}
          >
            Export Excel
          </button>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Gender</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {userData.length === 0 ? (
                <tr>
                  <td colSpan="5">No user data found</td>
                </tr>
              ) : (
                userData.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.contact}</td>
                    <td>{user.gender}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Log Section */}
      <div className="section">
        <div className="section-header">
          <h3>Employee Login Logs</h3>
          <button
            className="export-btn"
            onClick={() => exportToExcel(employeeLogs, "EmployeeLogs")}
          >
            Export Excel
          </button>
          <button className="export-btn" onClick={cleanLoginLogs}>
            Fix loginLogs
          </button>
          <button className="export-btn" onClick={resetLoginLogs}>
            Reset Login Logs
          </button>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Login Time</th>
                <th>Logout Time</th>
              </tr>
            </thead>
            <tbody>
              {employeeLogs.length === 0 ? (
                <tr>
                  <td colSpan="4">No logs available</td>
                </tr>
              ) : (
                employeeLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.empId}</td>
                    <td>{log.name}</td>
                    <td>{log.loginTime}</td>
                    <td>{log.logoutTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="section">
        <div className="section-header">
          <h3>Manage Employees</h3>
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Name"
            value={newEmp.name}
            onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Username"
            value={newEmp.username}
            onChange={(e) => setNewEmp({ ...newEmp, username: e.target.value })}
          />
          <input
            type="text"
            placeholder="Password"
            value={newEmp.password}
            onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
          />
          <button className="export-btn" onClick={handleAddEmployee}>
            Add Employee
          </button>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.empId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.username}</td>
                  <td>{emp.password}</td>
                  <td>
                    <button
                      className="update-btn"
                      onClick={() => {
                        const name = prompt("Update Name", emp.name);
                        const username = prompt("Update Username", emp.username);
                        const password = prompt("Update Password", emp.password);
                        if (name && username && password) {
                          handleUpdateEmployee(emp.id, {
                            name,
                            username,
                            password,
                          });
                        }
                      }}
                    >
                      Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
