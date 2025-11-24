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
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';

const POSTS_COLLECTION = 'posts';

/**
 * Real-time listener for all posts (feed)
 */
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

/**
 * Create a new post
 */
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

/**
 * (Still here if you use it somewhere else)
 * Increment likesCount for a post directly
 */
export async function incrementLikes(postId, delta = 1) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    likesCount: increment(delta),
  });
}

/**
 * Subscribe to a single post by ID (for the thread page)
 */
export function subscribeToPost(postId, callback) {
  const ref = doc(db, POSTS_COLLECTION, postId);

  const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    const data = snap.data();

    const post = {
      id: snap.id,
      authorId: data.authorId,
      authorEmail: data.authorEmail,
      authorName: data.authorName,
      content: data.content,
      createdAt: data.createdAt,
      likesCount: data.likesCount ?? 0,

      // UI-only flags
      isLiked: false,
      isBookmarked: false,
      timestamp: data.createdAt
        ? data.createdAt.toDate().toLocaleString()
        : 'Just now',
    };

    callback(post);
  });

  return unsub;
}

/**
 * Subscribe to replies for a post (subcollection: posts/{postId}/replies)
 */
export function subscribeToReplies(postId, callback) {
  const repliesRef = collection(db, POSTS_COLLECTION, postId, 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'asc'));

  const unsub = onSnapshot(q, (snapshot) => {
    const replies = snapshot.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        createdAt: data.createdAt,
        timestamp: data.createdAt
          ? data.createdAt.toDate().toLocaleString()
          : 'Just now',
      };
    });

    callback(replies);
  });

  return unsub;
}

/**
 * Create a reply under a post
 */
export async function createReply({ postId, content, user }) {
  if (!user) throw new Error('User must be logged in to reply');

  const repliesRef = collection(db, POSTS_COLLECTION, postId, 'replies');

  const displayName = user.displayName || user.email || 'Member';

  await addDoc(repliesRef, {
    content,
    authorId: user.uid,
    authorName: displayName,
    authorEmail: user.email || null,
    createdAt: serverTimestamp(),
  });
}

/**
 * 🔑 New: Toggle like for a post, one per user
 * stores likes in: posts/{postId}/likes/{userId}
 */
export async function toggleLike(postId, userId) {
  const likeRef = doc(db, POSTS_COLLECTION, postId, 'likes', userId);
  const postRef = doc(db, POSTS_COLLECTION, postId);

  const snap = await getDoc(likeRef);

  if (snap.exists()) {
    // UNLIKE
    await deleteDoc(likeRef);
    await updateDoc(postRef, {
      likesCount: increment(-1),
    });
    return false; // now unliked
  } else {
    // LIKE
    await setDoc(likeRef, {
      userId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(postRef, {
      likesCount: increment(1),
    });
    return true; // now liked
  }
}
