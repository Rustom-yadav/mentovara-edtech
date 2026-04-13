"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { calculateProgressPercent } from "@/utilities";

export function useWatchCourse(courseId, videoId) {
  const router = useRouter();

  const [video, setVideo] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState({ completedVideos: [] });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!videoId || !courseId) return;
    setLoading(true);
    try {
      const [videoRes, sectionsRes, progressRes] = await Promise.all([
        api.get(ENDPOINTS.VIDEO_BY_ID(videoId)),
        api.get(ENDPOINTS.COURSE_SECTIONS(courseId)).catch(() => ({
          data: { data: [] },
        })),
        api.get(ENDPOINTS.PROGRESS(courseId)).catch(() => ({
          data: { data: { completedVideos: [] } },
        })),
      ]);
      setVideo(videoRes.data?.data);
      setSections(sectionsRes.data?.data || []);
      setProgress(progressRes.data?.data || { completedVideos: [] });
    } catch {
      toast.error("Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [videoId, courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allVideos = useMemo(() => sections.flatMap((s) => s.videos || []), [sections]);
  
  const getNextVideo = useCallback(() => {
    const currentIdx = allVideos.findIndex((v) => v._id === videoId);
    return currentIdx >= 0 && currentIdx < allVideos.length - 1
      ? allVideos[currentIdx + 1]
      : null;
  }, [allVideos, videoId]);

  const markComplete = async () => {
    try {
      await api.post(ENDPOINTS.MARK_COMPLETE, { courseId, videoId });
      setProgress((prev) => ({
        ...prev,
        completedVideos: [...new Set([...prev.completedVideos, videoId])],
      }));
      toast.success("Marked as complete!");

      const nextVideo = getNextVideo();
      if (nextVideo) {
        router.push(`/watch/${courseId}/${nextVideo._id}`);
      }
    } catch {
      toast.error("Failed to mark as complete");
    }
  };

  const isCompleted = progress.completedVideos?.includes(videoId);
  const totalVideos = allVideos.length;
  const completedCount = allVideos.filter((v) =>
    progress.completedVideos?.includes(v._id)
  ).length;
  
  const progressPercent = useMemo(() => 
    calculateProgressPercent(completedCount, totalVideos),
    [completedCount, totalVideos]
  );

  const toggleSidebar = (val) => setSidebarOpen(typeof val === 'boolean' ? val : !sidebarOpen);

  return {
    video,
    sections,
    progress,
    loading,
    sidebarOpen,
    isCompleted,
    progressPercent,
    completedCount,
    totalVideos,
    toggleSidebar,
    markComplete,
    refreshData: loadData,
  };
}
