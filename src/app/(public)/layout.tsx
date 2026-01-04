'use client';

import { useSettings, SettingsProvider } from "@/contexts/SettingsContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import LightWaveEffect from "@/components/LightWaveEffect";

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings();

  return (
    <>
      {!isLoading && <LightWaveEffect enabled={settings.lightWaveEffect} />}
      <Header />
      <main className="pt-16 relative z-10">
        {children}
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </SettingsProvider>
  );
}
