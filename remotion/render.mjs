// Bundle một lần, rồi render ảnh tĩnh (stills.txt) hoặc cả video.
// Dùng: node render.mjs stills | video
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2] || 'stills';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Main'});
fs.mkdirSync('out', {recursive: true});

if (mode === 'video') {
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    audioCodec: 'aac',
    crf: 18,
    pixelFormat: 'yuv420p',
    outputLocation: 'out/video.mp4',
    concurrency: 4,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 20);
      if (p !== last) {
        last = p;
        console.log(`render ${Math.round(progress * 100)}%`);
      }
    },
  });
} else {
  const frames = fs.readFileSync('stills.txt', 'utf8').trim().split(/\s+/).map(Number);
  for (const frame of frames) {
    await renderStill({composition, serveUrl, output: `out/still_${String(frame).padStart(5, '0')}.png`, frame});
    console.log('still', frame);
  }
}
console.log('done');
