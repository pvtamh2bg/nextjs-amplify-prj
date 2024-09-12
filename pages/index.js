'use client'
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react'
import { listPosts } from '@/src/graphql/queries';
import Link from 'next/link'
import { getUrl } from 'aws-amplify/storage';

const client = generateClient();

export const getCoverImage = async (post) => {
  try {
    // Kiểm tra xem post.coverImage có hợp lệ không
    if (!post || !post.coverImage) {
      throw new Error("Image path is missing.");
    }

    // Lấy URL của hình ảnh bìa
    const imageUrl = await getUrl({ 
      path: post.coverImage,
      options: {
        expiresIn: 60, // URL có hiệu lực trong 60 giây
        validateObjectExistence: true, // Kiểm tra sự tồn tại của object
      } 
    });

    return imageUrl.url;
  } catch (error) {
    console.error('Error getting cover image:', error);
    return null;  // Hoặc trả về URL mặc định nếu có
  }
};

export default function Home() {
  const [posts, setPosts] = useState([])


  useEffect(() =>{
    fetchPosts();
  },[])

  const fetchPosts = async () => {
    try {
      const postsData = await client.graphql( {
        query: listPosts
      })
      const { items }  = postsData.data.listPosts

      const postsWithImage = await Promise.all(
        items.map(async (post) => {
          if(post.coverImage) {
            post.coverImage = await getCoverImage(post)
          }
          return post
        })
      )
      setPosts(postsWithImage)
    } catch (e) {
      console.log('Something went wrong', e);
    }
  }


  return (
    <section className='mt-10'>
      <h1 className="text-3xl underline">
       Posts
      </h1>
      {posts.map((post, i)=> (
        <Link  key={i} href={`/posts/${post.id}`}>
            <div className='p-5'>
              <h2 className="text-xl">{post.title}</h2>
              <p>Post by: {post.username}</p>
              { post.coverImage && (
                <img className="w-72 h-36" src={post.coverImage}/>
              )}
              <div className="mt-10 pl-5">
                { 
                  post.comments.items.length > 0 && post.comments.items.map(
                    (comment, index) => (
                       <div className='d-flex' key={index}>
                        <p className='text-gray-500 mt-2'>{comment.content}</p>
                        <p className='text-gray-200 mt-1'>{comment.createdBy}</p>
                       </div>
                    )
                  )
                }
              </div>
              <hr/>
            </div>
        </Link>
      ))}
    </section>
  );
}
