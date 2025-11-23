import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';

import { firestore } from './client';

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: Timestamp;
  likesCount: number;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: Timestamp;
};

export type CreatePostPayload = {
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
};

export type CreateCommentPayload = {
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
};

// Create a new post
export const createPost = async ({
  authorId,
  authorName,
  authorEmail,
  content,
}: CreatePostPayload): Promise<string> => {
  if (content.trim().length === 0) {
    throw new Error('Post content cannot be empty');
  }
  if (content.length > 280) {
    throw new Error('Post content cannot exceed 280 characters');
  }

  const postsRef = collection(firestore, 'posts');
  const docRef = await addDoc(postsRef, {
    authorId,
    authorName,
    authorEmail,
    content: content.trim(),
    createdAt: serverTimestamp(),
    likesCount: 0,
  });

  return docRef.id;
};

// Get all posts ordered by creation time (newest first)
export const getPosts = async (maxPosts: number = 50): Promise<Post[]> => {
  const postsRef = collection(firestore, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxPosts));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt,
  })) as Post[];
};

// Subscribe to posts updates (real-time)
export const subscribeToPosts = (
  callback: (posts: Post[]) => void,
  maxPosts: number = 50,
): (() => void) => {
  const postsRef = collection(firestore, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxPosts));

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt,
    })) as Post[];
    callback(posts);
  });
};

// Delete a post (only by author)
export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(firestore, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }

  const postData = postSnap.data();
  if (postData.authorId !== userId) {
    throw new Error('You can only delete your own posts');
  }

  await deleteDoc(postRef);
};

// Like a post
export const likePost = async (postId: string, userId: string): Promise<void> => {
  const likeRef = doc(firestore, 'posts', postId, 'likes', userId);
  const postRef = doc(firestore, 'posts', postId);

  // Check if already liked
  const likeSnap = await getDoc(likeRef);
  if (likeSnap.exists()) {
    return; // Already liked
  }

  // Add like document
  await setDoc(likeRef, {
    userId,
    createdAt: serverTimestamp(),
  });

  // Update likes count
  await updateDoc(postRef, {
    likesCount: increment(1),
  });
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  const likeRef = doc(firestore, 'posts', postId, 'likes', userId);
  const postRef = doc(firestore, 'posts', postId);

  // Check if liked
  const likeSnap = await getDoc(likeRef);
  if (!likeSnap.exists()) {
    return; // Not liked
  }

  // Remove like document
  await deleteDoc(likeRef);

  // Update likes count
  await updateDoc(postRef, {
    likesCount: increment(-1),
  });
};

// Check if user has liked a post
export const hasUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  const likeRef = doc(firestore, 'posts', postId, 'likes', userId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
};

// Get likes count for a post
export const getPostLikesCount = async (postId: string): Promise<number> => {
  const likesRef = collection(firestore, 'posts', postId, 'likes');
  const snapshot = await getDocs(likesRef);
  return snapshot.size;
};

// Create a comment on a post
export const createComment = async ({
  postId,
  authorId,
  authorName,
  authorEmail,
  content,
}: CreateCommentPayload): Promise<string> => {
  if (content.trim().length === 0) {
    throw new Error('Comment content cannot be empty');
  }
  if (content.length > 280) {
    throw new Error('Comment content cannot exceed 280 characters');
  }

  const commentsRef = collection(firestore, 'posts', postId, 'comments');
  const docRef = await addDoc(commentsRef, {
    authorId,
    authorName,
    authorEmail,
    content: content.trim(),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get comments for a post
export const getComments = async (postId: string): Promise<Comment[]> => {
  const commentsRef = collection(firestore, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    postId,
    ...doc.data(),
    createdAt: doc.data().createdAt,
  })) as Comment[];
};

// Subscribe to comments updates (real-time)
export const subscribeToComments = (
  postId: string,
  callback: (comments: Comment[]) => void,
): (() => void) => {
  const commentsRef = collection(firestore, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      postId,
      ...doc.data(),
      createdAt: doc.data().createdAt,
    })) as Comment[];
    callback(comments);
  });
};

// Delete a comment (only by author)
export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string,
): Promise<void> => {
  const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);

  if (!commentSnap.exists()) {
    throw new Error('Comment not found');
  }

  const commentData = commentSnap.data();
  if (commentData.authorId !== userId) {
    throw new Error('You can only delete your own comments');
  }

  await deleteDoc(commentRef);
};

