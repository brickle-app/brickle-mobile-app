import { PartialBrickleUser } from "@/src/types/user.types";

type RefreshAuthenticatedUserOptions = {
  email?: string | null;
  getUserByEmail: (email: string) => Promise<PartialBrickleUser | null>;
  setUser: (user: PartialBrickleUser) => void;
};

export async function refreshAuthenticatedUser({
  email,
  getUserByEmail,
  setUser,
}: RefreshAuthenticatedUserOptions) {
  if (!email) return;

  const user = await getUserByEmail(email);
  if (user) setUser(user);
}
