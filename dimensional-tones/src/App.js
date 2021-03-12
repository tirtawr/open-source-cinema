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
      <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - drag controls<br />
			Use "Shift+Click" to add/remove objects to/from a group.<br />
			Grouped objects can be transformed as a union.
    </div>
  );
}

export default App;
