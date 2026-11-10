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
import {Short6} from './lab/Short6';
import {Short7} from './lab/Short7';
import {Short8} from './lab/Short8';
import {Short9} from './lab/Short9';
import {Short10} from './lab/Short10';
import {Short11} from './lab/Short11';
import {Short12} from './lab/Short12';
import {Abg0} from './lab/Abg0';
import {Abg1} from './lab/Abg1';
import {AbgShort1} from './lab/AbgShort1';
import {AbgShort2} from './lab/AbgShort2';
import {Abg3} from './lab/Abg3';
import {AbgShort3} from './lab/AbgShort3';
import {Abg4} from './lab/Abg4';
import {AbgShort4} from './lab/AbgShort4';
import {Abg5} from './lab/Abg5';
import {AbgShort5} from './lab/AbgShort5';
import {Abg6} from './lab/Abg6';
import {Abg2} from './lab/Abg2';
import {Block, BLOCK_N} from './lab/Block';
import {Bundle, BUNDLE_N} from './lab/Bundle';
import {Infarct, INFARCT_N} from './lab/Infarct';
import {Occlusion, OCCL_N} from './lab/Occlusion';
import {Tachy, TACHY_N} from './lab/Tachy';
import {Wpw, WPW_N} from './lab/Wpw';
import {Wide, WIDE_N} from './lab/Wide';
import {Ectopy, ECTO_N} from './lab/Ectopy';
import {Mimic, MIMIC_N} from './lab/Mimic';
import {Lytes, LYTES_N} from './lab/Lytes';
import {Hyper, HYPER_DEMO_N} from './lab/Hyper';
import {TableScene, TABLE_DUR} from './lab/Table';
import {TableHand, TABLEHAND_DUR} from './lab/TableHand';
import {HeartBig, HEARTBIG_DUR} from './lab/HeartBig';
import data from './data.json';

export const Root: React.FC = () => (
  <>
    <Composition id="Abg2" component={Abg2} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Abg6" component={Abg6} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="AbgShort5" component={AbgShort5} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Abg5" component={Abg5} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="AbgShort4" component={AbgShort4} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Abg4" component={Abg4} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="AbgShort3" component={AbgShort3} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Abg3" component={Abg3} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="AbgShort2" component={AbgShort2} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="AbgShort1" component={AbgShort1} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Abg1" component={Abg1} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="AbgDemo" component={Abg0} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Main" component={Main} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Test3D" component={Test3D} durationInFrames={360} fps={30} width={1920} height={1080} />
    <Composition id="HeartBig" component={HeartBig} durationInFrames={HEARTBIG_DUR} fps={30} width={1920} height={1080} />
    <Composition id="TableHand" component={TableHand} durationInFrames={TABLEHAND_DUR} fps={30} width={1920} height={1080} />
    <Composition id="TableSample" component={TableScene} durationInFrames={TABLE_DUR} fps={30} width={1920} height={1080} />
    <Composition id="Hyper" component={Hyper} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="HyperDemo" component={Hyper} durationInFrames={Math.max(30, data.scenes[Math.min(HYPER_DEMO_N, data.scenes.length) - 1].from + data.scenes[Math.min(HYPER_DEMO_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="BlockDemo" component={Block} durationInFrames={Math.max(30, data.scenes[Math.min(BLOCK_N, data.scenes.length) - 1].from + data.scenes[Math.min(BLOCK_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="LytesDemo" component={Lytes} durationInFrames={Math.max(30, data.scenes[Math.min(LYTES_N, data.scenes.length) - 1].from + data.scenes[Math.min(LYTES_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="LytesFull" component={Lytes} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="MimicDemo" component={Mimic} durationInFrames={Math.max(30, data.scenes[Math.min(MIMIC_N, data.scenes.length) - 1].from + data.scenes[Math.min(MIMIC_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="MimicFull" component={Mimic} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="EctoDemo" component={Ectopy} durationInFrames={Math.max(30, data.scenes[Math.min(ECTO_N, data.scenes.length) - 1].from + data.scenes[Math.min(ECTO_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="EctoFull" component={Ectopy} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="WideDemo" component={Wide} durationInFrames={Math.max(30, data.scenes[Math.min(WIDE_N, data.scenes.length) - 1].from + data.scenes[Math.min(WIDE_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="WideFull" component={Wide} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="WpwDemo" component={Wpw} durationInFrames={Math.max(30, data.scenes[Math.min(WPW_N, data.scenes.length) - 1].from + data.scenes[Math.min(WPW_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="WpwFull" component={Wpw} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="TachyDemo" component={Tachy} durationInFrames={Math.max(30, data.scenes[Math.min(TACHY_N, data.scenes.length) - 1].from + data.scenes[Math.min(TACHY_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="TachyFull" component={Tachy} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="OcclDemo" component={Occlusion} durationInFrames={Math.max(30, data.scenes[Math.min(OCCL_N, data.scenes.length) - 1].from + data.scenes[Math.min(OCCL_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="OcclFull" component={Occlusion} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="InfarctDemo" component={Infarct} durationInFrames={Math.max(30, data.scenes[Math.min(INFARCT_N, data.scenes.length) - 1].from + data.scenes[Math.min(INFARCT_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="InfarctFull" component={Infarct} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="BundleDemo" component={Bundle} durationInFrames={Math.max(30, data.scenes[Math.min(BUNDLE_N, data.scenes.length) - 1].from + data.scenes[Math.min(BUNDLE_N, data.scenes.length) - 1].dur)} fps={data.fps} width={1920} height={1080} />
    <Composition id="BundleFull" component={Bundle} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="BlockFull" component={Block} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Short12" component={Short12} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short11" component={Short11} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short10" component={Short10} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short9" component={Short9} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short8" component={Short8} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short7" component={Short7} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
    <Composition id="Short6" component={Short6} durationInFrames={data.total} fps={data.fps} width={1080} height={1920} />
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
