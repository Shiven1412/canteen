import { useState, useEffect } from "react";
import { database } from "../firebase"; // Import your Firebase configuration
import { ref, onValue } from "firebase/database";
import { useAuth } from "../AuthContext";

const useAdmin = () => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (currentUser) {
      const adminRef = ref(database, `admins/${currentUser.uid}`);
      const unsubscribe = onValue(adminRef, (snapshot) => {
        setIsAdmin(!!snapshot.val());
        setLoading(false); // Set loading to false after fetching admin status
      });

      return () => unsubscribe();
    } else {
      setIsAdmin(false);
      setLoading(false); // Set loading to false if no user is logged in
    }
  }, [currentUser]);

  return { isAdmin, loading };
};

export default useAdmin;
