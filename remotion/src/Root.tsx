import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {Test3D} from './three/Test3D';
import {WBSample} from './wb/Sample';
import {LabSample, LAB_DUR} from './lab/Lab';
import {VectorSample, VEC_DUR} from './lab/Vector';
import {PaperSample, PAPER_DUR} from './lab/Paper';
import {Demo} from './lab/Demo';
import {Demo2} from './lab/Demo2';
import {Full} from './lab/Full';
import {Approach} from './lab/Approach';
import {Short1} from './lab/Short1';
import {Short2} from './lab/Short2';
import {Short3} from './lab/Short3';
import {Short4} from './lab/Short4';
import {Short5} from './lab/Short5';
import {Block, BLOCK_N} from './lab/Block';
import {Bundle, BUNDLE_N} from './lab/Bundle';
import {Infarct, INFARCT_N} from './lab/Infarct';
import {Occlusion, OCCL_N} from './lab/Occlusion';
import {Hyper, HYPER_DEMO_N} from './lab/Hyper';
import {TableScene, TABLE_DUR} from './lab/Table';
import {TableHand, TABLEHAND_DUR} from './lab/TableHand';
import {HeartBig, HEARTBIG_DUR} from './lab/HeartBig';
import data from './data.json';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Test3D" component={Test3D} durationInFrames={360} fps={30} width={1920} height={1080} />
    <Composition id="HeartBig" component={HeartBig} durationInFrames={HEARTBIG_DUR} fps={30} width={1920} height={1080} />
    <Composition id="TableHand" component={TableHand} durationInFrames={TABLEHAND_DUR} fps={30} width={1920} height={1080} />
    <Composition id="TableSample" component={TableScene} durationInFrames={TABLE_DUR} fps={30} width={1920} height={1080} />
    <Composition id="Hyper" component={Hyper} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="HyperDemo" component={Hyper} durationInFrames={Math.max(30, data.scenes[Math.min(HYPER_DEMO_N, data.scenes.length) - 1].from + data.scenes[Math.min(HYPER_DEMO_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="BlockDemo" component={Block} durationInFrames={Math.max(30, data.scenes[Math.min(BLOCK_N, data.scenes.length) - 1].from + data.scenes[Math.min(BLOCK_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="OcclDemo" component={Occlusion} durationInFrames={Math.max(30, data.scenes[Math.min(OCCL_N, data.scenes.length) - 1].from + data.scenes[Math.min(OCCL_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="OcclFull" component={Occlusion} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="InfarctDemo" component={Infarct} durationInFrames={Math.max(30, data.scenes[Math.min(INFARCT_N, data.scenes.length) - 1].from + data.scenes[Math.min(INFARCT_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="InfarctFull" component={Infarct} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="BundleDemo" component={Bundle} durationInFrames={Math.max(30, data.scenes[Math.min(BUNDLE_N, data.scenes.length) - 1].from + data.scenes[Math.min(BUNDLE_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="BundleFull" component={Bundle} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="BlockFull" component={Block} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Short5" component={Short5} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short4" component={Short4} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short3" component={Short3} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short2" component={Short2} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short1" component={Short1} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Approach" component={Approach} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Full" component={Full} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Demo2" component={Demo2} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Demo" component={Demo} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="PaperSample" component={PaperSample} durationInFrames={PAPER_DUR} fps={30} width={1920} height={1080} />
    <Composition id="VectorSample" component={VectorSample} durationInFrames={VEC_DUR} fps={30} width={1920} height={1080} />
    <Composition id="LabSample" component={LabSample} durationInFrames={LAB_DUR} fps={30} width={1920} height={1080} />
    <Composition id="WBSample" component={WBSample} durationInFrames={600} fps={30} width={1920} height={1080} />
  </>
);
