// @mui material components
import Card from "@mui/material/Card";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftAvatar from "components/SoftAvatar";
import SoftBadge from "components/SoftBadge";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// React
import React, { useState, useEffect } from 'react';

function Tables() {
  const [employeeData, setemployeeData] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // setLoading(true);
    // Fetch data from the API
    fetch('http://localhost:3001/employee/')
      .then((response) => response.json())
      .then((response) => {
        setemployeeData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [loading]);

  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Master Data - Employee</SoftTypography>
            </SoftBox>
            {/* {loading ? (
              <div>Loading...</div>
            ) : ( */}
            <Table
              columns={[
                { name: "no", align: "center" },
                { name: "full name", align: "center" },
                { name: "position", align: "center" },
                { name: "division", align: "center" },
                { name: "created date", align: "center" },
                { name: "created by", align: "center" },
                { name: "action", align: "center" },
              ]}
              rows={Array.isArray(employeeData) ? employeeData.map((data, index) => ({
                "no": index + 1,
                "full name": data.fullName,
                "position": data.positionName,
                "division": data.divisionName,
                "created date": data.createdDate,
                "created by": data.createdBy,
                "action": "x",
              })) : []}
            />
            {/* )} */}
          </Card>
        </SoftBox>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
