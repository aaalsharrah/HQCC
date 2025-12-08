// ⚠️ NO 'use client' here!

import AdminEventRegistrationsClient from './AdminEventRegistrationsClient';

// For static export: tell Next not to generate any specific IDs
export function generateStaticParams() {
  return [];
}

// Optional: make it explicit that we don't support arbitrary dynamic params
export const dynamicParams = false;

export default function AdminEventRegistrationsPage(props) {
  return <AdminEventRegistrationsClient {...props} />;
}
