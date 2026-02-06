import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Room } from '../types';
import styles from './RoomsPage.module.css';

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setIsCreating(true);
    try {
      const room = await api.createRoom(newRoomName);
      setRooms([room, ...rooms]);
      setNewRoomName('');
      navigate(`/rooms/${room.id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await api.joinRoom(roomId);
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>チャットルーム</h1>
        <div className={styles.userInfo}>
          <span>ようこそ、{user?.username} さん</span>
          <button onClick={logout} className={styles.logoutBtn}>
            ログアウト
          </button>
        </div>
      </header>

      <form onSubmit={handleCreateRoom} className={styles.createForm}>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="新しいルーム名..."
          className={styles.input}
        />
        <button type="submit" disabled={isCreating} className={styles.createBtn}>
          {isCreating ? '作成中...' : 'ルームを作成'}
        </button>
      </form>

      <div className={styles.roomList}>
        {rooms.length === 0 ? (
          <p className={styles.empty}>まだルームがありません。新しいルームを作成してください！</p>
        ) : (
          rooms.map((room) => {
            const isMember = room.members.some((m) => m.userId === user?.id);
            return (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.roomInfo}>
                  <h3>{room.name}</h3>
                  <p>{room.members.length} 人のメンバー</p>
                </div>
                {isMember ? (
                  <Link to={`/rooms/${room.id}`} className={styles.enterBtn}>
                    入室
                  </Link>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className={styles.joinBtn}
                  >
                    参加
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
