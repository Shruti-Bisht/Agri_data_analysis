// src/components/DataTable.js
import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';


const DataTable = () => {
  const [data, setData] = useState([]);
  const [maxMinProductionData, setMaxMinProductionData] = useState([]);
  const [averageData, setAverageData] = useState([]);

  useEffect(() => {
    fetch('./DataSet.json')
      .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
      })
      .then((data) => {
        // Handle missing values
        const processedData = data.map((item) => ({
            ...item,
            "Crop Production (UOM:t(Tonnes))": item["Crop Production (UOM:t(Tonnes))"] || 0,
            "Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))": item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"] || 0,
            "Area Under Cultivation (UOM:Ha(Hectares))": item["Area Under Cultivation (UOM:Ha(Hectares))"] || 0,
        }));
        setData(processedData);
        setMaxMinProductionData(calculateMaxMinProduction(processedData));
        console.log(maxMinProductionData)
        setAverageData(calculateAverages(processedData));
        console.log(averageData)
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [averageData,maxMinProductionData,data]);

  const calculateMaxMinProduction = (data) => {
    const years = Array.from(new Set(data.map((item) => item.Year.slice(-4))));
    return years.map((year) => {
      const crops = data.filter((item) => item.Year.slice(-4) === year);
      const maxProductionCrop = crops.reduce((max, crop) => (crop["Crop Production (UOM:t(Tonnes))"] > max["Crop Production (UOM:t(Tonnes))"] ? crop : max));
      const minProductionCrop = crops.reduce((min, crop) => (crop["Crop Production (UOM:t(Tonnes))"] < min["Crop Production (UOM:t(Tonnes))"] ? crop : min));
      return {
        Year: year,
        "Crop_Maximum_Production": maxProductionCrop["Crop Name"],
        "Crop_Minimum_Production": minProductionCrop["Crop Name"],
      };
    });
  };

  const calculateAverages = (data) => {
    const crops = Array.from(new Set(data.map((item) => item["Crop Name"])));
    return crops.map((crop) => {
      const cropData = data.filter((item) => item["Crop Name"] === crop);
      const totalYield = cropData.reduce((sum, item) => sum + parseFloat(item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]), 0);
      const totalArea = cropData.reduce((sum, item) => sum + parseFloat(item["Area Under Cultivation (UOM:Ha(Hectares))"]), 0);
      const count = cropData.length;
      return {
        Crop: crop,
        "Average_Yield_kg": (totalYield / count).toFixed(3),
        "Average_Cultivation_Area_Ha": (totalArea / count).toFixed(3),
      };
    });
  };

  const rows1 = maxMinProductionData.map((element) => (
    <Table.Tr key={element.Year}>
      <Table.Td>{element.Year}</Table.Td>
      <Table.Td>{element.Crop_Maximum_Production}</Table.Td>
      <Table.Td>{element.Crop_Minimum_Production}</Table.Td>
    </Table.Tr>
  ));

  const rows2 = averageData.map((element) => (
    <Table.Tr key={element.Crop}>
      <Table.Td>{element.Crop}</Table.Td>
      <Table.Td>{element.Average_Yield_kg}</Table.Td>
      <Table.Td>{element.Average_Cultivation_Area_Ha}</Table.Td>
    </Table.Tr>
  ));

  return (
 <div>
    <h2>Crop Production Analysis by Year</h2>
      <Table horizontalSpacing="xl" highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr >
          <Table.Th >Year</Table.Th>
          <Table.Th>Crop with Maximum Production (in this Year)</Table.Th>
          <Table.Th>Crop with Minimum Production (in this Year)</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows1}</Table.Tbody>
    </Table>

    <h2>Average Yield and Cultivation Area (1950-2020)</h2>
    <Table  horizontalSpacing="xl"  highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr >
          <Table.Th>Crop</Table.Th>
          <Table.Th>Average Yield of theCrop between 1950-2020  (kg/Ha)</Table.Th>
          <Table.Th>Average Cultivation Area of the Crop between 1950-2020 (Ha)</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows2}</Table.Tbody>
    </Table>
 </div>
);
};

export default DataTable;
