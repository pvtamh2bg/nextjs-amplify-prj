'use client'
import React, { useEffect, useState } from 'react'
import { Authenticator } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

const Profile = () => {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [userAttributes, setUserAttributes] = useState(null)

  useEffect(() => {
    getUserAttributes()
  }, [])

  const getUserAttributes = async () => {
    if(user?.username) {
      const userAttrs = await fetchUserAttributes();
      console.log(JSON.stringify(userAttrs))
      setUserAttributes(userAttrs)
    }
  }

  return (
    <Authenticator>
      <h1>You are logged username: {user?.username}</h1>
      <p>Email: {userAttributes?.email}</p>
      <button style={{backGround: '#3333', padding: '5 10'}} onClick={() => signOut()}>Sign out</button>
    </Authenticator>
  )
}

export default Profile
