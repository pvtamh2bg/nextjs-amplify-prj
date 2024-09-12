import React from 'react';

// Giả sử hàm này lấy dữ liệu từ cơ sở dữ liệu
async function fetchPosts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'First Post' },
        { id: 2, title: 'Second Post' },
      ]);
    }, 1000);
  });
}

 const ServerComponent = async () =>  {
  const posts = await fetchPosts();

  return (
    <div>
      <h1>Server Component</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default ServerComponent
