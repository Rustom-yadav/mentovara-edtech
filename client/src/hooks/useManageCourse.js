"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import api from "@/services/api";
import { ENDPOINTS, DIRECT_API_URL } from "@/services/endpoints";
import { toFormData } from "@/utilities";

export function useManageCourse(courseId) {
  const accessToken = useSelector((s) => s.auth.accessToken);

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSectionLoading, setAddingSectionLoading] = useState(false);
  const [uploadingVideoFor, setUploadingVideoFor] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, sectionsRes] = await Promise.all([
        api.get(ENDPOINTS.COURSE_BY_ID(courseId)),
        api.get(ENDPOINTS.COURSE_SECTIONS(courseId)).catch(() => ({
          data: { data: [] },
        })),
      ]);
      setCourse(courseRes.data?.data);
      setSections(sectionsRes.data?.data || []);
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a new section
  async function handleAddSection(e) {
    if (e) e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setAddingSectionLoading(true);
    try {
      const res = await api.post(ENDPOINTS.ADD_SECTION(courseId), {
        title: newSectionTitle.trim(),
      });
      setSections((prev) => [...prev, res.data?.data]);
      setNewSectionTitle("");
      toast.success("Section added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add section");
    } finally {
      setAddingSectionLoading(false);
    }
  }

  // Delete a section
  async function handleDeleteSection(sectionId) {
    if (!confirm("Delete this section and all its videos?")) return;
    try {
      await api.delete(ENDPOINTS.SECTION_BY_ID(sectionId));
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  }

  // Upload video to a section
  async function handleUploadVideo(sectionId, { title, video }) {
    if (!title?.trim() || !video) {
        toast.error("Video title and file are required");
        return;
    }

    setUploadingVideoFor(sectionId);
    try {
      const formData = toFormData({ title, video, section: sectionId });

      const res = await axios.post(
        `${DIRECT_API_URL}${ENDPOINTS.VIDEOS}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          withCredentials: true,
          timeout: 5 * 60 * 1000, // 5 minutes
        },
      );
      const newVideo = res.data?.data;
      setSections((prev) =>
        prev.map((s) =>
          s._id === sectionId
            ? { ...s, videos: [...(s.videos || []), newVideo] }
            : s,
        ),
      );
      toast.success("Video uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload video");
    } finally {
      setUploadingVideoFor(null);
    }
  }

  // Delete a video
  async function handleDeleteVideo(videoId, sectionId) {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(ENDPOINTS.VIDEO_BY_ID(videoId));
      setSections((prev) =>
        prev.map((s) =>
          s._id === sectionId
            ? { ...s, videos: s.videos.filter((v) => v._id !== videoId) }
            : s,
        ),
      );
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    }
  }

  return {
    course,
    sections,
    loading,
    newSectionTitle,
    addingSectionLoading,
    uploadingVideoFor,
    setNewSectionTitle,
    handleAddSection,
    handleDeleteSection,
    handleUploadVideo,
    handleDeleteVideo,
    refreshData: loadData,
  };
}
