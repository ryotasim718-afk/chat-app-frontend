import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { api } from '../services/api';
import type { Message, Room } from '../types';
import styles from './ChatRoomPage.module.css';

export function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const { user } = useAuth();

  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleUserTyping = useCallback(
    (data: { userId: string; username: string; isTyping: boolean }) => {
      if (data.userId === user?.id) return;
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        if (data.isTyping) {
          newMap.set(data.userId, data.username);
        } else {
          newMap.delete(data.userId);
        }
        return newMap;
      });
    },
    [user?.id]
  );

  const { sendMessage, sendTyping } = useSocket(id, {
    onNewMessage: handleNewMessage,
    onUserTyping: handleUserTyping,
  });

  useEffect(() => {
    if (id) {
      loadRoom(id);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoom = async (roomId: string) => {
    try {
      const data = await api.getRoom(roomId);
      setRoom(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage);
    setNewMessage('');
    sendTyping(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (!room) {
    return <div className={styles.loading}>ルームが見つかりません</div>;
  }

  const typingUsersArray = Array.from(typingUsers.values());

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/rooms" className={styles.backBtn}>
          &larr; 戻る
        </Link>
        <div className={styles.roomTitle}>
          <h1>{room.name}</h1>
          <span>{room.members.length} 人のメンバー</span>
        </div>
      </header>

      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.empty}>まだメッセージがありません。会話を始めましょう！</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === user?.id;
            return (
              <div
                key={message.id}
                className={`${styles.message} ${isOwn ? styles.own : ''}`}
              >
                <div className={styles.messageContent}>
                  {!isOwn && (
                    <span className={styles.username}>{message.user.username}</span>
                  )}
                  <p>{message.content}</p>
                  <span className={styles.time}>{formatTime(message.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsersArray.length > 0 && (
        <div className={styles.typing}>
          {typingUsersArray.join(', ')} さんが入力中...
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="メッセージを入力..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendBtn}>
          送信
        </button>
      </form>
    </div>
  );
}
