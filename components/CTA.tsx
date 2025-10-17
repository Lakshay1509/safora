"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { ArrowRight } from "lucide-react";


const CTA = () => {
  const { user, loading} = useAuth();
  const router = useRouter();

  if (loading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  return (
    <>
      {!user && (
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="bg-black text-white flex items-center justify-center space-x-2 px-3 sm:px-5 md:px-6 lg:px-4 py-1.5 sm:py-2 transition-transform hover:scale-105 cursor-pointer"
          onClick={() => {
            router.push("/login");
          }}
        >
          <span className="flex items-center space-x-2 text-sm md:text-base">
            <span>Get Started</span>
            <ArrowRight size={18} />
          </span>
        </HoverBorderGradient>
      )}

      {user && (
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="bg-black text-white flex items-center justify-center space-x-2 px-3 sm:px-5 md:px-6 lg:px-4 py-1.5 sm:py-2 transition-transform hover:scale-105 cursor-pointer"
          onClick={() => {
            router.push("/community");
          }}
        >
          <span className="flex items-center space-x-2 text-sm md:text-base">
            <span>Community</span>
            <ArrowRight size={18} />
          </span>
        </HoverBorderGradient>
      )}
    </>
  );
};

export default CTA;
