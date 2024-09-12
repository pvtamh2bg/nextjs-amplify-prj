import Layout from './components/layout'
import { Authenticator } from '@aws-amplify/ui-react';
import "./globals.css";
import '@aws-amplify/ui-react/styles.css'; // default theme
 
export default function MyApp({ Component, pageProps }) {
  return (
    <Authenticator.Provider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Authenticator.Provider>
  )
}
