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
<<<<<<< HEAD
import { createNotification } from './notifications';
=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00

const POSTS_COLLECTION = 'posts';

/**
 * Real-time listener for all posts (feed)
<<<<<<< HEAD
 * @param {function} callback - Callback function that receives posts array
 * @param {string} userId - Optional current user ID to check if posts are liked
 */
export function subscribeToPosts(callback, userId = null) {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const postsPromises = snapshot.docs.map(async (d) => {
      const data = d.data();

      // Check if current user has liked this post
      let isLiked = false;
      if (userId) {
        try {
          const likeRef = doc(db, POSTS_COLLECTION, d.id, 'likes', userId);
          const likeSnap = await getDoc(likeRef);
          isLiked = likeSnap.exists();
        } catch (err) {
          console.error('Error checking like status for post', d.id, err);
        }
      }

=======
 */
export function subscribeToPosts(callback) {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => {
      const data = d.data();

>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
      return {
        id: d.id,
        authorId: data.authorId,
        authorEmail: data.authorEmail,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt,
        likesCount: data.likesCount ?? 0,
<<<<<<< HEAD
        imageUrl: data.imageUrl || null,

        // UI-only fields
        isLiked,
=======

        // UI-only fields (not stored in Firestore)
        isLiked: false,
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
        isBookmarked: false,
        timestamp: data.createdAt
          ? data.createdAt.toDate().toLocaleString()
          : 'Just now',
      };
    });

<<<<<<< HEAD
    const posts = await Promise.all(postsPromises);
=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
    callback(posts);
  });

  return unsubscribe;
}

/**
 * Create a new post
 */
<<<<<<< HEAD
export async function createPost({ content, user, imageUrl = null }) {
=======
export async function createPost({ content, user }) {
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
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

<<<<<<< HEAD
  // Add image URL if provided
  if (imageUrl) {
    postDoc.imageUrl = imageUrl;
    console.log('Creating post with imageUrl:', imageUrl);
  }

  const docRef = await addDoc(postsRef, postDoc);
  console.log('Post created with ID:', docRef.id, 'Data:', { ...postDoc, id: docRef.id });
=======
  const docRef = await addDoc(postsRef, postDoc);
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
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
<<<<<<< HEAD
 * @param {string} postId - Post ID
 * @param {function} callback - Callback function that receives the post
 * @param {string} userId - Optional current user ID to check if post is liked
 */
export function subscribeToPost(postId, callback, userId = null) {
  const ref = doc(db, POSTS_COLLECTION, postId);

  const unsub = onSnapshot(ref, async (snap) => {
=======
 */
export function subscribeToPost(postId, callback) {
  const ref = doc(db, POSTS_COLLECTION, postId);

  const unsub = onSnapshot(ref, (snap) => {
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
    if (!snap.exists()) {
      callback(null);
      return;
    }

    const data = snap.data();

<<<<<<< HEAD
    // Check if current user has liked this post
    let isLiked = false;
    if (userId) {
      try {
        const likeRef = doc(db, POSTS_COLLECTION, postId, 'likes', userId);
        const likeSnap = await getDoc(likeRef);
        isLiked = likeSnap.exists();
      } catch (err) {
        console.error('Error checking like status:', err);
      }
    }

=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
    const post = {
      id: snap.id,
      authorId: data.authorId,
      authorEmail: data.authorEmail,
      authorName: data.authorName,
      content: data.content,
      createdAt: data.createdAt,
      likesCount: data.likesCount ?? 0,

      // UI-only flags
<<<<<<< HEAD
      isLiked,
=======
      isLiked: false,
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
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
<<<<<<< HEAD

  // Create notification for post author
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const postData = postSnap.data();
      const postAuthorId = postData.authorId;

      // Don't create notification if user is replying to their own post
      if (postAuthorId && postAuthorId !== user.uid) {
        // Get actor (user who replied) details from members collection
        const actorRef = doc(db, 'members', user.uid);
        const actorSnap = await getDoc(actorRef);
        
        let actorName = displayName;
        let actorAvatar = null;

        if (actorSnap.exists()) {
          const actorData = actorSnap.data();
          actorName = actorData.name || displayName;
          actorAvatar = actorData.avatar || null;
        }

        // Create notification
        await createNotification({
          userId: postAuthorId,
          type: 'reply',
          actorId: user.uid,
          actorName,
          actorAvatar,
          postId,
          postContent: postData.content || null,
        });
      }
    }
  } catch (error) {
    // Don't fail the reply operation if notification creation fails
    console.error('Error creating reply notification:', error);
  }
=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
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
<<<<<<< HEAD

    // Create notification for post author
    try {
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data();
        const postAuthorId = postData.authorId;

        // Don't create notification if user is liking their own post
        if (postAuthorId && postAuthorId !== userId) {
          // Get actor (user who liked) details from members collection
          const actorRef = doc(db, 'members', userId);
          const actorSnap = await getDoc(actorRef);
          
          let actorName = 'Someone';
          let actorAvatar = null;

          if (actorSnap.exists()) {
            const actorData = actorSnap.data();
            actorName = actorData.name || actorData.email?.split('@')[0] || 'Someone';
            actorAvatar = actorData.avatar || null;
          }

          // Create notification
          await createNotification({
            userId: postAuthorId,
            type: 'like',
            actorId: userId,
            actorName,
            actorAvatar,
            postId,
            postContent: postData.content || null,
          });
        }
      }
    } catch (error) {
      // Don't fail the like operation if notification creation fails
      console.error('Error creating like notification:', error);
    }

=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
    return true; // now liked
  }
}
