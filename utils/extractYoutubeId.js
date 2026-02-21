export const extractYouTubeId = (url) => {
  const regExp =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/;

  const match = url.match(regExp);

  return match ? match[1] : null;
};