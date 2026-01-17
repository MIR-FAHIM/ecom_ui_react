// src/context/DataContext.js
import React, { createContext, useState, useEffect } from "react";


// Create the context
export const DataContext = createContext();

// Create a provider component
export const DataProvider = ({ children }) => {
  const [categories, setCategory] = useState([]);
  const [brandss, setBrand] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
   
     
      setLoading(false);
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs only once when the component is mounted.

  return (
    <DataContext.Provider value={{ categories, brandss, loading }}>
      {children}
    </DataContext.Provider>
  );
};
