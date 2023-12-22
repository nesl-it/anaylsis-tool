import { YoutubeTranscript } from "youtube-transcript";

/**
 * 
 * @param vId This can be the id or URL of the video
 * @returns Text paragraph of the transcript
 */
export const getYTVideoTranscript = async (vId: string) => {
  let data = await YoutubeTranscript.fetchTranscript(vId);
  let text = data.map((el) => el.text).join(" ");
  return text;
};
