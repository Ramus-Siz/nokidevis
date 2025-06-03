"use client";
import { useState } from "react";

import { redirect } from "next/navigation";
export default function Home() {
  
   
  const isAuthenticated = false;

  if (!isAuthenticated) {
    redirect("/login");
  }

  redirect("/dashboard");
  
}
