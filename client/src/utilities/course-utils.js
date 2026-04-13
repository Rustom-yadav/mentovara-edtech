/**
 * Formats seconds into h m string (e.g., "1h 30m")
 */
export function formatDuration(seconds) {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Calculates total duration of a course from sections
 */
export function calculateTotalDuration(sections) {
  if (!sections) return 0;
  return sections.reduce(
    (sum, sec) =>
      sum +
      (sec.videos?.reduce((vSum, v) => vSum + (v.duration || 0), 0) || 0),
    0
  );
}

/**
 * Returns the total count of videos across all sections
 */
export function countTotalVideos(sections) {
  if (!sections || !Array.isArray(sections)) return 0;
  return sections.reduce((sum, sec) => sum + (sec.videos?.length || 0), 0);
}

/**
 * Calculates progress percentage
 */
export function calculateProgressPercent(completedCount, totalCount) {
  if (!totalCount || totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

/**
 * Finds the first unwatched video or returns the absolute first video
 */
export function findFirstUnwatched(sections, completedVideoIds) {
  if (!sections || !Array.isArray(sections)) return null;
  const allVideos = sections.flatMap((s) => s.videos || []);
  if (allVideos.length === 0) return null;

  const firstUnwatched = allVideos.find(
    (v) => !completedVideoIds?.includes(v._id)
  );

  return firstUnwatched || allVideos[0];
}

/**
 * Checks if user is the course instructor
 */
export function isCourseOwner(course, userId) {
  if (!course || !userId) return false;
  const instructorId = course.instructor?._id || course.instructor;
  return instructorId === userId;
}
