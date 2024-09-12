import React, { useState, useEffect} from 'react'
import { getCurrentUser } from 'aws-amplify/auth';
import Link from 'next/link'
import { postsByUsername } from '../src/graphql/queries'
import { generateClient } from 'aws-amplify/api'

// Mutations
import { deletePost as deletePostMutation } from '@/src/graphql/mutations';

const client = generateClient();

const Posts = () => {
  const [posts, setPosts] = useState([])

  useEffect(()=>{
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const { username } = await getCurrentUser();

    const postsData = await client.graphql({
      query: postsByUsername,
      variables: { username }
    })

    setPosts(postsData.data.postsByUsername.items)
  }

  async function deletePost(id) {
    await client.graphql({
      query: deletePostMutation,
      variables: { input: {id} }
    })
  }

  return (
    <section className='mt-10'>
      <h1 className="text-3xl underline">
      My Posts
      </h1>
      {posts.map((post, i)=> (
        <Link key={i} href={`/posts/${post.id}`}>
            <div className='py-5'>
              <h2 className="text-xl">{post.title}</h2>
              <p>Post by: {post.username}</p>
              <div className='mt-5'>
              <Link href={`/posts/${id}`}>View Post</Link>
              <Link href={`/edit-post/${id}`}>Edit Post</Link>
              <button style={{backGround: '#3333', padding: '5 10'}} onClick={() => deletePost(post.id)}>Delete</button>
              </div>
              <hr/>
            </div>
        </Link>
      ))}
    </section>
  )
}

export default Posts
