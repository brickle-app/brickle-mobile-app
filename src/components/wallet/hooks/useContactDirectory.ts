import { createContact, searchUser } from "@/src/services/brickle.service";
import { Contact } from "@/src/types/forms";
import { useState } from "react";

export const useContactDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contact, setContact] = useState<Contact | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchContact = async (
    userId: string,
    userEmail: string,
    searchTerm: string
  ) => {
    try {
      setIsLoading(true);
      const response = await searchUser(userId, userEmail, searchTerm);
      if (response && response.length > 0) {
        setContact(response[0]);
        setUserNotFound(false);
        setIsLoading(false);
      } else {
        setContact(null);
        setUserNotFound(true);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      setUserNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (
    userId: string,
    userEmail: string,
    contactId: string
  ) => {
    setIsLoading(true);
    if (userId && contactId) {
      await createContact(userId, contactId, userEmail);
      setContact(null);
      setSearchTerm("");
    }
    setIsLoading(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    contact,
    setContact,
    searchContact,
    addContact,
    isLoading,
    userNotFound,
  };
};
