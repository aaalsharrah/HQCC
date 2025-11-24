// app/lib/posts.js
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';

const POSTS_COLLECTION = 'posts';

// Real-time listener for posts
export function subscribeToPosts(callback) {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        authorId: data.authorId,
        authorEmail: data.authorEmail,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt,
        likesCount: data.likesCount ?? 0,

        // UI-only fields (not stored in Firestore)
        isLiked: false,
        isBookmarked: false,
        timestamp: data.createdAt
          ? data.createdAt.toDate().toLocaleString()
          : 'Just now',
      };
    });

    callback(posts);
  });

  return unsubscribe;
}

// Create a new post using *your* schema
export async function createPost({ content, user }) {
  if (!user) throw new Error('User must be logged in to create a post');

  const postsRef = collection(db, POSTS_COLLECTION);

  const postDoc = {
    authorId: user.uid,
    authorName:
      user.displayName ||
      (user.email && user.email.split('@')[0]) ||
      'Member',
    authorEmail: user.email || null,
    content,
    createdAt: serverTimestamp(),
    likesCount: 0,
  };

  const docRef = await addDoc(postsRef, postDoc);
  return { id: docRef.id, ...postDoc };
}

// OPTIONAL: persist likesCount in Firestore
export async function incrementLikes(postId, delta = 1) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    likesCount: increment(delta),
  });
}
