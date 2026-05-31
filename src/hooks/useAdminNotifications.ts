import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useAdminNotifications(isAdmin: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      setUnreadCount(0);
      setUnreadMessages(0);
      setUnreadFeedback(0);
      return;
    }

    let unsubscribeMessages: () => void;
    let unsubscribeFeedback: () => void;

    const messagesQuery = query(
      collection(db, 'contact_messages'),
      where('status', '==', 'new')
    );
    
    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      let count = snapshot.docs.length;
      setUnreadMessages(count);
    }, (error) => {
      console.error("Messages snapshot error:", error);
    });

    const feedbackQuery = query(
      collection(db, 'feedback'),
      where('status', '==', 'new')
    );
    
    unsubscribeFeedback = onSnapshot(feedbackQuery, (snapshot) => {
      let count = snapshot.docs.length;
      setUnreadFeedback(count);
    }, (error) => {
      console.error("Feedback snapshot error:", error);
    });

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeFeedback) unsubscribeFeedback();
    };
  }, [isAdmin]);

  useEffect(() => {
    setUnreadCount(unreadMessages + unreadFeedback);
  }, [unreadMessages, unreadFeedback]);

  return { unreadCount, unreadMessages, unreadFeedback };
}
