import './App.css';
import DataTable from './components/DataTable.jsx';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

function App() {
  
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS defaultColorScheme="dark">
      <div style={{ padding: '20px' }}>
        <h1>Indian Agriculture Data</h1>
        <DataTable />
      </div>
    </MantineProvider>
  );
}

export default App;
