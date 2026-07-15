import { refreshAuthenticatedUser } from "./refresh-authenticated-user";

describe("refreshAuthenticatedUser", () => {
  it("fetches the latest user by email and updates the store", async () => {
    const latestUser = {
      id: "user-1",
      email: "hijap71603@meikeya.com",
      isFullProfileComplete: true,
    };
    const getUserByEmail = jest.fn().mockResolvedValue(latestUser);
    const setUser = jest.fn();

    await refreshAuthenticatedUser({
      email: "hijap71603@meikeya.com",
      getUserByEmail,
      setUser,
    });

    expect(getUserByEmail).toHaveBeenCalledWith("hijap71603@meikeya.com");
    expect(setUser).toHaveBeenCalledWith(latestUser);
  });

  it("does nothing when no email is available", async () => {
    const getUserByEmail = jest.fn();
    const setUser = jest.fn();

    await refreshAuthenticatedUser({
      email: undefined,
      getUserByEmail,
      setUser,
    });

    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
  });
});
