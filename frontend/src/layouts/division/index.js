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
import axios from "axios";

function Tables() {
  const [divisionData, setDivisionData] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // setLoading(true);
    // Fetch data from the API
    fetch('http://localhost:3001/division/')
      .then((response) => response.json())
      .then((response) => {
        setDivisionData(response.data);
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
              <SoftTypography variant="h6">Master Data - Division</SoftTypography>
            </SoftBox>
            {/* {loading ? (
              <div>Loading...</div>
            ) : ( */}
            <Table
              columns={[
                { name: "no", align: "center" },
                { name: "division code", align: "center" },
                { name: "division name", align: "center" },
                { name: "created date", align: "center" },
                { name: "created by", align: "center" },
                { name: "action", align: "center" },
              ]}
              rows={Array.isArray(divisionData) ? divisionData.map((data, index) => ({
                "no": index + 1,
                "division code": data.divisionCode.toUpperCase(),
                "division name": data.divisionName.toUpperCase(),
                "created date": data.createdDate.toUpperCase(),
                "created by": data.createdBy.toUpperCase(),
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
