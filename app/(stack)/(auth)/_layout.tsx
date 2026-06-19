import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F6F6F6",
        },
      }}
    >
      <Stack.Screen
        name="login/index"
        options={{
          title: "Login"
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          title: "Register"
        }}
      />
      <Stack.Screen
        name="complete-profile/index"
        options={{
          title: "Complete Profile"
        }}
      />
      <Stack.Screen
        name="kyc-failed/index"
        options={{
          title: "KYC Failed"
        }}
      />
      <Stack.Screen
        name="kyc-success/index"
        options={{
          title: "KYC Success"
        }}
      />
      <Stack.Screen
        name="verify-otp/index"
        options={{
          title: "Verify OTP"
        }}
      />
      <Stack.Screen
        name="redirect-handler/index"
        options={{
          title: "Redirecting"
        }}
      />
    </Stack>
  );
} 