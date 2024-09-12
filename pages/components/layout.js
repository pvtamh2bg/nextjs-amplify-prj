import { Inter } from "next/font/google";
import ConfigureAmplifyClientSide from '@/ConfigureAmplifyClientSide';
import Navbar from './navbar'
 
export default function Layout({ children }) {
  return (
    <>
      <ConfigureAmplifyClientSide />
      <Navbar/>
      <main>{children}</main>
    </>
  )
}
