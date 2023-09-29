import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from "axios";

function App() {

    const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/employee")
    .then(response => setEmployeeData(response.data))
  }, []);  

  return (
    <div className="App">
      <header className="App-header">
        <p>Hello World!</p> 
      </header>
    </div>
  );
}

export default App;
