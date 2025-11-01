"use client";

import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";

interface NavbarWrapperProps {
  patientName?: string;
  children?: React.ReactNode;
}

export function NavbarWrapper({
  patientName = "Donald Duck",
  children,
}: NavbarWrapperProps) {
  const pathname = usePathname();

  // Get page name from pathname
  const getPageName = () => {
    if (pathname === "/") return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Page";
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  // For now, use default values
  // In a real app, this would come from a context or API call
  const navbarProps = {
    name: patientName,
    label: getPageName(),
    nextAppt: null,
    primaryDoctorText: "Smith",
  };

  return (
    <>
      <Navbar {...navbarProps} />
      {children}
    </>
  );
}
