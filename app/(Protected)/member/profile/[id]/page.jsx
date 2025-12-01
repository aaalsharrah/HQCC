// app/(protected)/member/profile/[id]/page.jsx

import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage({ params }) {
  // params.id is the profile user id
  const { id } = await params;

  return <ProfilePageClient profileId={id} />;
}
