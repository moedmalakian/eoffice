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
import axios from 'axios';

function Division() {
  const [divisionData, setDivisionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/division/') 
      .then((response) => {
        setDivisionData(response.data.data); 
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
            <Table
              columns={[
                { name: "no", align: "center" },
                { name: "division code", align: "center" },
                { name: "division name", align: "center" },
                { name: "created date", align: "center" },
                { name: "created by", align: "center" },
                { name: "action", align: "center" },
              ]}
              rows={Array.isArray(divisionData) ? divisionData.map((data, index) => { 
                function capitalizeWords(text) {
                  return text.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                    return a.toUpperCase();
                  });
                }
                
                return (
                  {
                    "no": index + 1,
                    "division code": data.divisionCode,
                    "division name": capitalizeWords(data.divisionName),
                    "created date": data.createdDate,
                    "created by": capitalizeWords(data.createdBy),
                    "action": 
                      <ul>
                        <SoftBox>
                        <a href={`http://localhost:3001/division/${data.divId}`}>
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

export default Division;
