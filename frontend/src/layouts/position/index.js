// @mui material components
import Card from "@mui/material/Card";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// React
import React, { useState, useEffect } from 'react';

function Position() {
  const [positionData, setPositionData] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // setLoading(true);
    // Fetch data from the API
    fetch('http://localhost:3001/position/')
      .then((response) => response.json())
      .then((response) => {
        setPositionData(response.data);
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
              <SoftTypography variant="h6">Master Data - Position</SoftTypography>
            </SoftBox>
            {/* {loading ? (
              <div>Loading...</div>
            ) : ( */}
            <Table
              columns={[
                { name: "no", align: "center" },
                { name: "position code", align: "center" },
                { name: "position name", align: "center" },
                { name: "created date", align: "center" },
                { name: "created by", align: "center" },
                { name: "action", align: "center" },
              ]}
              rows={Array.isArray(positionData) ? positionData.map((data, index) => { 
                function capitalizeWords(text) {
                  return text.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                    return a.toUpperCase();
                  });
                }
                
                return (
                  {
                    "no": index + 1,
                    "position code": data.positionCode,
                    "position name": capitalizeWords(data.positionName),
                    "created date": data.createdDate,
                    "created by": capitalizeWords(data.createdBy),
                    "action": 
                      <ul>
                        <SoftBox>
                        <a href={`http://localhost:3001/position/${data.posId}`}>
                          <SoftButton variant="text" color="secondary">
                            view
                          </SoftButton>
                        </a>
                          <SoftButton variant="text" color="info">
                            edit
                          </SoftButton>
                          <SoftButton variant="text" color="error">
                            delete
                          </SoftButton>
                        </SoftBox> 
                      </ul> 
                  }
                )
              }) 
              :
              []}
            />
          </Card>
        </SoftBox>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Position;
