import { createContext, useState, useEffect } from "react";
import { fetchEnums } from "api/enumsApi";

export const EnumsContext = createContext();

export const EnumsProvider = ({ children }) => {
  const [enums, setEnums] = useState({
    animalTypeOptions: [],
    breedingStatusOptions: [],
    genderOptions: [],
    healthStatusOptions: []
  });

   useEffect(() => {
      const loadEnums = async () => {
        try {
            const data = await fetchEnums();
            setEnums(data);
        } catch (error) {
            console.error("Error fetching enums:", error);
        }
      };
  
      loadEnums();
    }, []);

  return (
    <EnumsContext.Provider value={enums}>
      {children}
    </EnumsContext.Provider>
  );
};
