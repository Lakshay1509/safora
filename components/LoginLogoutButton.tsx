"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-action";
import { useQueryClient } from "@tanstack/react-query";

const LoginButton = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  if (user) {
    return (
      <Button
      variant="outline"
        onClick={async() => {
          const result = await signout();
          setUser(null);
          queryClient.invalidateQueries({queryKey:["user"]});
          
          // Only redirect after invalidation has been triggered
          if (result?.success) {
            router.push("/logout");
          }
        }}
      >
        Log out
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
