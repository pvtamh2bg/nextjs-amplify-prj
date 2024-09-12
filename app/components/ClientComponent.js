'use client';

import React, { useState } from 'react';

export default function ClientComponent() {
  const [title, setTitle] = useState('');
  const [posts, setPosts] = useState([]);

  const addPost = () => {
    setPosts([...posts, { id: posts.length + 1, title }]);
    setTitle('');
  };

  return (
    <div>
      <h1>Client Component</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter post title"
      />
      <button onClick={addPost}>Add Post</button>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
