/* eslint-disable react/jsx-no-target-blank */
import { useEffect } from 'react';

import './App.css';
import Engine from './lib/Engine'

function App() {

  useEffect(() => {
    Engine.init()
    Engine.animate()
  });

  return (
    <div id="info">
      Move objects around with your mouse by dragging them around the screen.<br />
			Use mouse and scroll wheel to move the camera around.
    </div>
  );
}

export default App;
