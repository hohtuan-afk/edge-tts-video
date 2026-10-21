import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import data from './data.json';

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={data.total} fps={data.fps} width={1920} height={1080} />
);
