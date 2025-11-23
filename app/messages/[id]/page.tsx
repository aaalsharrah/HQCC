import ChatPage from './page-client'

export async function generateStaticParams() {
  return []
}

export default function Wrapper() {
  return <ChatPage />
}
