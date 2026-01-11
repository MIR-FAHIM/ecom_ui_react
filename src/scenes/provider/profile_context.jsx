import { createContext, useContext, useEffect, useState } from 'react';

const ProfileContext = createContext();
   
export const ProfileProvider = ({ children }) => {

     const userID = localStorage.getItem("userId");
  const [userProfileData, setUserProfileData] = useState(null);
  const [profileLoading, setLoading] = useState(true);



  useEffect(() => {
 
  }, []);

  return (
    <ProfileContext.Provider value={{ userProfileData, profileLoading, setUserProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
