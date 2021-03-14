/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-target-blank */
import { useEffect } from 'react';

import './App.css';
import Engine from './lib/Engine'

function App() {

  useEffect(() => {
    Engine.init()
    Engine.animate()
  });

  const onPlayTogether = () => {
    console.log('PlayTogether')
  }

  const onPlayAlternating = () => {
    console.log('PlayAlternating')
  }

  const onStop = () => {
    console.log('Stop')
  }

  return (
    <div id="info">
      Move objects around with your mouse by dragging them around the screen.<br />
			Use mouse and scroll wheel to move the camera around.<br/>
      <a onClick={onPlayTogether}>Play Together</a> . <a onClick={onPlayAlternating}>Play Alternating</a> . <a onClick={onStop}>Stop</a>
    </div>
  );
}

export default App;
