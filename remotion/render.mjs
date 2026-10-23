// Bundle một lần, rồi render ảnh tĩnh (stills.txt) hoặc cả video.
// Dùng: node render.mjs stills | video
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2] || 'stills';
const is3d = mode.startsWith('test3d');
const isWB = mode.startsWith('wbsample');
const isLab = mode.startsWith('labsample');
const isVec = mode.startsWith('vecsample');
const isPaper = mode.startsWith('papersample');
const id = is3d ? 'Test3D' : isWB ? 'WBSample' : isLab ? 'LabSample' : isVec ? 'VectorSample' : isPaper ? 'PaperSample' : 'Main';
const chromiumOptions = {gl: 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id, chromiumOptions});
fs.mkdirSync('out', {recursive: true});

if (is3d) {
  for (const frame of [45, 180, 330]) {
    await renderStill({composition, serveUrl, output: `out/t3d_${frame}.png`, frame, chromiumOptions});
    console.log('still', frame);
  }
  if (mode === 'test3d') {
    const t0 = Date.now();
    await renderMedia({
      composition, serveUrl, codec: 'h264', crf: 20, pixelFormat: 'yuv420p', outputLocation: 'out/test3d.mp4',
      concurrency: 4, chromiumOptions,
      onProgress: ({progress, renderedFrames}) => { if (renderedFrames % 30 === 0) console.log(`3d ${Math.round(progress * 100)}% ${renderedFrames}f ${((Date.now() - t0) / 1000).toFixed(0)}s`); },
    });
  }
  console.log('done');
  process.exit(0);
}

if (isPaper) {
  for (const frame of [60, 270, 400, 530, 640, 700, 790]) {
    await renderStill({composition, serveUrl, output: `out/pap_${String(frame).padStart(4, '0')}.png`, frame, chromiumOptions});
    console.log('still', frame);
  }
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 22, pixelFormat: 'yuv420p', outputLocation: 'out/paper_sample.mp4', concurrency: 4, chromiumOptions});
  console.log('done');
  process.exit(0);
}

if (isVec) {
  for (const frame of [100, 150, 300, 360, 470, 600, 700, 860]) {
    await renderStill({composition, serveUrl, output: `out/vec_${String(frame).padStart(4, '0')}.png`, frame, chromiumOptions});
    console.log('still', frame);
  }
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 22, pixelFormat: 'yuv420p', outputLocation: 'out/vec_sample.mp4', concurrency: 4, chromiumOptions});
  console.log('done');
  process.exit(0);
}

if (isLab) {
  for (const frame of [120, 200, 300, 360, 470, 578, 700, 750]) {
    await renderStill({composition, serveUrl, output: `out/lab_${String(frame).padStart(4, '0')}.png`, frame, chromiumOptions});
    console.log('still', frame);
  }
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 22, pixelFormat: 'yuv420p', outputLocation: 'out/lab_sample.mp4', concurrency: 4, chromiumOptions});
  console.log('done');
  process.exit(0);
}

if (isWB) {
  for (const frame of [40, 140, 210, 290, 360, 440, 520, 590]) {
    await renderStill({composition, serveUrl, output: `out/wb_${String(frame).padStart(4, '0')}.png`, frame, chromiumOptions});
    console.log('still', frame);
  }
  if (mode === 'wbsample-video') {
    await renderMedia({composition, serveUrl, codec: 'h264', crf: 22, pixelFormat: 'yuv420p', outputLocation: 'out/wb_sample.mp4', concurrency: 4, chromiumOptions});
  }
  console.log('done');
  process.exit(0);
}

if (mode === 'video') {
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    audioCodec: 'aac',
    crf: 22,
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
