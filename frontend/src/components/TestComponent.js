import axios from 'axios';
import { useEffect, useState } from 'react';

const TestComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log('API URL:', process.env.REACT_APP_BACKEND_API_URL);
    try {
      const response = axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/`);
      console.log('Data:', response.data);
    } catch (error) {
      console.error('There was an error!', error.response ? error.response.data : error.message);
    }
    axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('There was an error!', error);
      });
  }, []);

  return (
    <div>
      {data ? (
        <div>Data from backend: {JSON.stringify(data)}</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default TestComponent;