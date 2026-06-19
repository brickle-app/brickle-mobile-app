import { Tabs } from "expo-router";
import { Colors } from "@/assets/Colors";
import CustomHeader from "@/src/components/ui/customHeader/customHeader";
import HomeIcon from "@/assets/icons/SVG/Home.svg";
import DiscoverIcon from "@/assets/icons/SVG/Buscar.svg";
import PortfolioIcon from "@/assets/icons/SVG/Portafolio.svg";
import WalletIcon from "@/assets/icons/SVG/Wallet.svg";
import { authStore } from "@/src/store/auth.store";
import { StandaloneHeader } from "@/src/components";

export default function TabLayout() {
  const { user } = authStore();

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarShowLabel: false,
        header: () => <CustomHeader />,
        tabBarStyle: {
          backgroundColor: "#F6F6F6",
          height: 70,
        },
        tabBarIconStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 60,
          width: 60,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon width={52} height={52} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover/index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <DiscoverIcon width={52} height={52} color={color} />
          ),
          header: () => (
            <CustomHeader
              variant="profile"
              title="Descubrir Activos"
              backDestination="/dashboard"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio/index"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, focused }) => (
            <PortfolioIcon width={52} height={52} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet/index"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <WalletIcon width={52} height={52} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          href: null,
          header: () => <CustomHeader variant="profile" title="Mi perfil" />,
        }}
      />
      <Tabs.Screen
        name="profile/personal-details/index"
        options={{
          href: null,
          header: () => (
            <CustomHeader
              variant="profile"
              title="Mis detalles"
              backDestination="/profile"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/legal-documents/index"
        options={{
          href: null,
          header: () => (
            <CustomHeader
              variant="profile"
              title="Documentos legales"
              backDestination="/profile"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/security/index"
        options={{
          href: null,
          header: () => (
            <CustomHeader
              variant="profile"
              title="Seguridad"
              backDestination="/profile"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/settings/index"
        options={{
          href: null,
          header: () => (
            <CustomHeader
              variant="profile"
              title="Configuración"
              backDestination="/profile"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leasing/index"
        options={{
          href: null,
          header: () => (<></>)
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          href: null,
          header: () => (
            <CustomHeader
              variant="profile"
              title="Notificaciones"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-investments/index"
        options={{
          href: null,
          header: () => (
            <CustomHeader
              variant="profile"
              title="Mis inversiones"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="onramp/success/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onramp/failed/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/pin-setup"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
