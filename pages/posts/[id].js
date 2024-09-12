import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/router';
import { generateClient } from 'aws-amplify/api';
import { listPosts, getPost } from '../../src/graphql/queries';
import { getCoverImage } from '../index'
import { v4 as uuid } from 'uuid'
import { createComment } from '../../src/graphql/mutations';
import dynamic from 'next/dynamic'
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false
})
// import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

import ReactMarkDown from 'react-markdown'
const client = generateClient();

const initialComment = { content: '' }
export default function Post({ post }) {
  const [coverImage, setCoverImage] = useState(null)
  const [comment, setComment] = useState(initialComment)
  const [isShowComment, setShowComment] = useState(false)
  const router = useRouter();

  useEffect(() => {
    updateCoverImage(post)
  }, [post])


  const { content } = comment
  const toggleShowComment = () => {
    setShowComment((preIsShowComment) => !preIsShowComment );
  }

  const createTheComment = async () => {
    if(!content) return

    try {
      await client.graphql({
        query: createComment,
        variables: { input: comment },
        authMode: 'userPool'
      })

      router.push('/my-posts')
    } catch (error) {
      console.log(error)
    }

  }

  async function updateCoverImage (post) {
    const coverImageUrl = await getCoverImage(post)
    setCoverImage(coverImageUrl)
  }

  // Nếu trang chưa được tạo, hiển thị trạng thái tải
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <h1>Post title: {post.title}</h1>
    <p>Post by: {post.username}</p>
    { (post.coverImage && coverImage) && (
      <img src={coverImage} className="w-72 h-72" />
    )}
    <div className='mt-8'>
      <ReactMarkDown className="prose">{post.content}</ReactMarkDown>
      <button type='button' onClick={toggleShowComment}
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >Write a comment</button>
      <div style={{display: isShowComment ? 'block' : 'none'}}>
        <SimpleMDE
          value={comment.content}
          onChange={(value)=> setComment(() => ({...comment, content: value, postID: post.id}))}
        />
        <button type='button' onClick={createTheComment}
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >Submit</button>
      </div>
    </div>
    </>
  )
}

// Hàm này sẽ xác định các đường dẫn động mà bạn muốn tạo
export async function getStaticPaths() {

  const posts = await client.graphql({
    query: listPosts
  });

  const paths = posts.data.listPosts.items.map((post) => ({
    params: { id: post.id },
  }));

  return { paths, fallback: true };
}

// Hàm này sẽ lấy dữ liệu cho từng trang động
export async function getStaticProps({ params }) {
  const { id } = params;
  const postData = await client.graphql({
    query: getPost,
    variables: { id }
  });

  return {
    props: {
      post: postData.data.getPost,
    },
  };
}

