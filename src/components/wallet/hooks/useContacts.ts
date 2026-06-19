import { getUserContacts } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { Contact } from "@/src/types/forms";
import { useState, useCallback } from "react";

import { useEffect } from "react";

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { user } = authStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (user?.id && user?.email) {
      setIsLoading(true);
      try {
        const fetchedContacts = await getUserContacts(user.id, user.email);
        setContacts(fetchedContacts || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return { contacts: filteredContacts, searchTerm, setSearchTerm, isLoading, refreshContacts: fetchContacts };
};
