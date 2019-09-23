import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { suspensify } from '../src';

import './style.css';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DelayedHello name="Bob" delay={1000} />
    </Suspense>
  );
}

interface DelayedHelloProps {
  delay: number;
  name: string;
}

const [getSuspendedHello, { clearCacheForArgs }] = suspensify(
  (name: string, delay: number) => {
    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        resolve(`Hello, ${name}`);
      }, delay);
    });
  },
);

function DelayedHello({ delay, name }: DelayedHelloProps) {
  const hello = getSuspendedHello(name, delay);
  return <div>{hello}</div>;
}

render(<App />, document.getElementById('app'));
