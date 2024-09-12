import React, { useRef, useEffect, useState } from 'react'
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { createPost } from '@/src/graphql/mutations'
import { useRouter } from 'next/router';
import {v4 as uuid} from 'uuid'
import dynamic from 'next/dynamic'
import { Authenticator } from '@aws-amplify/ui-react';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false
})
// import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

const client = generateClient();

const initialPost = { title: '', content: ''}
export const upload2Cloud = async (path, file) => {
  try {
    const result = await uploadData({
      path: path,
      data: file,
      options: {
        contentType: "image/jpeg",
      }
    }).result;
    console.log('Succeeded: ', result);
  } catch (error) {
    console.log('Error : ', error);
  }
}

const CreatePost = () => {
  const [post, setPost] = useState(initialPost)
  const [image, setImage] = useState(null)
  const imageFileInput = useRef(null)
  const router = useRouter()



  const uploadImage = async () => {
    imageFileInput.current.click()
  }

  const handleChange = (e) => {
    const fileUploaded = e.target.files[0]
    if(!fileUploaded) return;
    setImage(fileUploaded)
  }

  const { title, content} = post

  const onChange = (e) => {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value
    }))
  }
  
  const createNewPost = async () => {
    if(!title && !content) return;
    const id = uuid()
    post.id = id

    if(image) {
      const fileName = `public/${image.name}_${uuid()}`
      post.coverImage =  fileName
      await upload2Cloud(fileName, image)
    }

    client.graphql({
      query: createPost,
      variables: {input: post},
      authMode: 'userPool'
    })

    router.push(`/posts/${id}`)
  }

  return (
    <Authenticator>
      <h1>Create Post</h1>
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
      { image && (
        <img src={URL.createObjectURL(image)} className=""/>
      )}
      <button type='button' onClick={createNewPost}
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >Submit</button>
      {" "}
      <button type='button' onClick={uploadImage}
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >Upload cover image</button>
    </Authenticator>
  )
}

export default CreatePost
