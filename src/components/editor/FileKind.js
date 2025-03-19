

// Update the isImageFile function to include more media types
export const isImageFile = (filename) => {
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// Add functions to check for video and audio files
export const isVideoFile = (filename) => {
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const isAudioFile = (filename) => {
const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'];
return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};