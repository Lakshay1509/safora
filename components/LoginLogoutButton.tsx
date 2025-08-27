"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signout } from "@/lib/auth-action";
import { useAuth } from "@/contexts/AuthContext";

const LoginButton = () => {
  const { user, loading, setUser } = useAuth(); // Get setUser from context
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  if (loading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <Button
        variant="outline"
        disabled={isLoggingOut}
        onClick={async () => {
          setIsLoggingOut(true);
          const result = await signout();
          
          if (result?.success) {
            setUser(null); // Manually set user to null on the client
            router.push("/");
            router.refresh();
          } else {
            // Re-enable the button if logout fails
            setIsLoggingOut(false);
          }
        }}
      >
        {isLoggingOut ? "Logging out..." : "Log out"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push("/login");
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;