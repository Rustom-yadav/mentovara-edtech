"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/common/HeroSection";
import Features from "@/components/common/Features";
import PopularCoursesList from "@/components/course/PopularCoursesList";
import TeachCTA from "@/components/common/TeachCTA";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <Features />
      <PopularCoursesList />
      <TeachCTA />
    </div>
  );
}
import api from "@/services/api";
