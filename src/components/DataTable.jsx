import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';

const DataTable = () => {
  // State to store the fetched data, max and min production data, and average data
  const [data, setData] = useState([]);
  const [maxMinProductionData, setMaxMinProductionData] = useState([]);
  const [averageData, setAverageData] = useState([]);

  // Effect hook to fetch data when the component mounts
  useEffect(() => {
    fetch('./DataSet.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        // Handle missing values by setting them to 0
        const processedData = data.map((item) => ({
          ...item,
          "Crop Production (UOM:t(Tonnes))": item["Crop Production (UOM:t(Tonnes))"] || 0,
          "Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))": item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"] || 0,
          "Area Under Cultivation (UOM:Ha(Hectares))": item["Area Under Cultivation (UOM:Ha(Hectares))"] || 0,
        }));
        setData(processedData);
        // Calculate max and min production data
        setMaxMinProductionData(calculateMaxMinProduction(processedData));
        // Calculate average yield and cultivation area
        setAverageData(calculateAverages(processedData));
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Function to calculate crops with maximum and minimum production by year
  const calculateMaxMinProduction = (data) => {
    // Extract unique years from the data
    const years = Array.from(new Set(data.map((item) => item.Year.slice(-4))));
    return years.map((year) => {
      // Filter crops for the given year
      const crops = data.filter((item) => item.Year.slice(-4) === year);
      // Find crop with maximum production
      const maxProductionCrop = crops.reduce((max, crop) => (crop["Crop Production (UOM:t(Tonnes))"] > max["Crop Production (UOM:t(Tonnes))"] ? crop : max));
      // Find crop with minimum production
      const minProductionCrop = crops.reduce((min, crop) => (crop["Crop Production (UOM:t(Tonnes))"] < min["Crop Production (UOM:t(Tonnes))"] ? crop : min));
      return {
        Year: year,
        "Crop_Maximum_Production": maxProductionCrop["Crop Name"],
        "Crop_Minimum_Production": minProductionCrop["Crop Name"],
      };
    });
  };

  // Function to calculate average yield and cultivation area for each crop
  const calculateAverages = (data) => {
    // Extract unique crop names from the data
    const crops = Array.from(new Set(data.map((item) => item["Crop Name"])));
    return crops.map((crop) => {
      // Filter data for the given crop
      const cropData = data.filter((item) => item["Crop Name"] === crop);
      // Calculate total yield for the crop
      const totalYield = cropData.reduce((sum, item) => sum + parseFloat(item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]), 0);
      // Calculate total cultivation area for the crop
      const totalArea = cropData.reduce((sum, item) => sum + parseFloat(item["Area Under Cultivation (UOM:Ha(Hectares))"]), 0);
      // Count the number of records for the crop
      const count = cropData.length;
      return {
        Crop: crop,
        "Average_Yield_kg": (totalYield / count).toFixed(3),
        "Average_Cultivation_Area_Ha": (totalArea / count).toFixed(3),
      };
    });
  };

  // Create rows for the max and min production table
  const rows1 = maxMinProductionData.map((element) => (
    <Table.Tr key={element.Year}>
      <Table.Td>{element.Year}</Table.Td>
      <Table.Td>{element.Crop_Maximum_Production}</Table.Td>
      <Table.Td>{element.Crop_Minimum_Production}</Table.Td>
    </Table.Tr>
  ));

  // Create rows for the average yield and cultivation area table
  const rows2 = averageData.map((element) => (
    <Table.Tr key={element.Crop}>
      <Table.Td>{element.Crop}</Table.Td>
      <Table.Td>{element.Average_Yield_kg}</Table.Td>
      <Table.Td>{element.Average_Cultivation_Area_Ha}</Table.Td>
    </Table.Tr>
  ));

  // Render the tables
  return (
    <div>
      <h2>Crop Production Analysis by Year</h2>
      <Table horizontalSpacing="xl" highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Year</Table.Th>
            <Table.Th>Crop with Maximum Production (in this Year)</Table.Th>
            <Table.Th>Crop with Minimum Production (in this Year)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows1}</Table.Tbody>
      </Table>

      <h2>Average Yield and Cultivation Area (1950-2020)</h2>
      <Table horizontalSpacing="xl" highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Crop</Table.Th>
            <Table.Th>Average Yield of the Crop between 1950-2020 (kg/Ha)</Table.Th>
            <Table.Th>Average Cultivation Area of the Crop between 1950-2020 (Ha)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        
