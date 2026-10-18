/**
 * Text-to-speech playback. Previously inlined in the store's response handler.
 */

let context: AudioContext | null = null;

// One AudioContext for the lifetime of the window; the old code built a new one
// per utterance, and browsers cap how many you can create.
function getContext(): AudioContext {
  if (!context) context = new AudioContext();
  return context;
}

export async function play(pcm: Uint8Array): Promise<void> {
  const ctx = getContext();
  // Safari rejects a detached/shared buffer, and decodeAudioData takes
  // ownership, so hand it a standalone copy.
  const buffer = pcm.buffer.slice(
    pcm.byteOffset,
    pcm.byteOffset + pcm.byteLength
  ) as ArrayBuffer;
  const audioBuffer = await ctx.decodeAudioData(buffer);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(0);
}
