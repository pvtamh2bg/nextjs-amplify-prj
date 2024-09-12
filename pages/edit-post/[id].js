import React, { useEffect, useState, useRef } from 'react'
import { generateClient } from 'aws-amplify/api';
import { updatePost as updatePostMutation } from '@/src/graphql/mutations'
import { getPost } from '@/src/graphql/queries'
import { useRouter } from 'next/router';
import { getCoverImage } from '../index'
import { upload2Cloud } from '../create-post'
import { v4 as uuid } from 'uuid'

import dynamic from 'next/dynamic'
import { Authenticator } from '@aws-amplify/ui-react';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false
})
// import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

const client = generateClient();

const initialPost = { title: '', content: ''}

const EditPost = () => {
  const [post, setPost] = useState(initialPost)
  const [coverImage, setCoverImage] = useState(null)
  const [localImage, setLocalImage] = useState(null)
  const imageFileInput = useRef(null)
  const router = useRouter()
  const { id } = router.query
  useEffect(()=> {
    fetchPost()

    async function fetchPost() {
      if (!id) return
      const postData = await client.graphql({
        query: getPost,
        variables: { id }
      })

      setPost(postData.data.getPost)
      if (postData.data.getPost.coverImage) {
        setCoverImage(await getCoverImage(postData.data.getPost))
      }
    }
  },[id])

  if (!post) return null

  const { title, content} = post
  const uploadCoverImage = async () => {
    imageFileInput.current.click()
  }

  const handleChange = (e) => {
    const fileUploaded = e.target.files[0]
    if(!fileUploaded) return;
    setCoverImage(fileUploaded)
    setLocalImage(URL.createObjectURL(fileUploaded))
  }

  const onChange = (e) => {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value
    }))
  }

  const updatePost = async () => {
    if(!title && !content) return;
    const postUpdated = {
      id,
      title,
      content
    }
    if(coverImage && localImage) {
      const fileName = `public/${coverImage.name}_${uuid()}`
      postUpdated.coverImage =  fileName
      await upload2Cloud(fileName, coverImage)
    }

    client.graphql({
      query: updatePostMutation,
      variables: {input: postUpdated},
      authMode: 'userPool'
    })

    router.push(`/my-posts`)
  }

  return (
    <Authenticator>
      <h1>Edit post</h1>
      { coverImage && (
         <img className="w-72 h-36" src={localImage || coverImage}/>
      )}
      <input
        value={post.title}
        onChange={onChange}
        placeholder="Title"
        name='title'
      />
      <SimpleMDE
        value={post.content}
        onChange={(value)=> setPost(() => ({...post, content: value}))}
      />
      <input type="file"
        ref={imageFileInput}
        onChange={handleChange}
        className="absolute w-0 h-0"
      />
      <button type='button' onClick={updatePost}
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >Submit</button>

      <button type='button' onClick={uploadCoverImage}
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >Upload cover image</button>
    </Authenticator>
  )
}

export default EditPost
