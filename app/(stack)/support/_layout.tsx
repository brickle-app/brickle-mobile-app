import { StandaloneHeader } from "@/src/components";
import { Stack } from "expo-router";
import React from "react";

export default function SupportLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="help"
        options={{
          title: "help",
          header: () => (
            <StandaloneHeader
              title="Centro de Ayuda"
            />
          ),
        }}
      />
    </Stack>
  );
}
