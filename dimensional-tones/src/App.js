/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-target-blank */
import { useEffect, useState } from 'react';

import './App.css';
import Engine from './lib/Engine'

function App() {

  const [playbackStatus, setPlaybackStatus] = useState('stopped');

  useEffect(() => {
    Engine.init()
    Engine.animate()
  }, []);

  const onPlayConcurrent = () => {
    if (playbackStatus !== 'stopped') Engine.resetPlayback()
    setPlaybackStatus('concurrent');
    Engine.playConcurrent()
  }

  const onPlayAlternating = () => {
    if (playbackStatus !== 'stopped') Engine.resetPlayback()
    setPlaybackStatus('alternating');
    Engine.playAlternating();
  }

  const onStop = () => {
    setPlaybackStatus('stopped');
    Engine.resetPlayback()
  }

  const onRandomizeTonalBoxesPosition = () => {
    Engine.randomizeTonalBoxesPosition()
  }

  return (
    <div id="info">
      Move objects around with your mouse by dragging them around the screen.<br />
			Use mouse and scroll wheel to move the camera around.<br/>
      <a onClick={onPlayConcurrent}>Play Together</a> . <a onClick={onPlayAlternating}>Play Alternating</a> . <a onClick={onStop}>Stop</a><br/>
      <a onClick={onRandomizeTonalBoxesPosition}>Randomize Position</a>
    </div>
  );
}

export default App;
