import React from 'react';
import ServerComponent from './ServerComponent';
import ClientComponent from './ClientComponent';

export default function CombinedComponent() {
  return (
    <div>
      <ServerComponent />
      <ClientComponent />
    </div>
  );
}
