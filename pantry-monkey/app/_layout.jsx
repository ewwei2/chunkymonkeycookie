import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipeDetail" />
      <Stack.Screen name="recipeCategory" />
      <Stack.Screen name="categoryItem" />
    </Stack>
  );
}
