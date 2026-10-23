import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {Test3D} from './three/Test3D';
import {WBSample} from './wb/Sample';
import {LabSample, LAB_DUR} from './lab/Lab';
import {VectorSample, VEC_DUR} from './lab/Vector';
import {PaperSample, PAPER_DUR} from './lab/Paper';
import data from './data.json';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
    <Composition id="Test3D" component={Test3D} durationInFrames={360} fps={30} width={1920} height={1080} />
    <Composition id="PaperSample" component={PaperSample} durationInFrames={PAPER_DUR} fps={30} width={1920} height={1080} />
    <Composition id="VectorSample" component={VectorSample} durationInFrames={VEC_DUR} fps={30} width={1920} height={1080} />
    <Composition id="LabSample" component={LabSample} durationInFrames={LAB_DUR} fps={30} width={1920} height={1080} />
    <Composition id="WBSample" component={WBSample} durationInFrames={600} fps={30} width={1920} height={1080} />
  </>
);
