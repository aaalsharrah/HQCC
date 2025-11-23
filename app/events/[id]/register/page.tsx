import EventRegistrationPage from './page-client'

export async function generateStaticParams() {
  return []
}

export default function Wrapper() {
  return <EventRegistrationPage />
}
