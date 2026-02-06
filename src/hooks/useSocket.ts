import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import type { Message } from '../types';

interface SocketEvents {
  onNewMessage?: (message: Message) => void;
  onUserJoined?: (data: { userId: string; username: string }) => void;
  onUserLeft?: (data: { userId: string; username: string }) => void;
  onUserTyping?: (data: { userId: string; username: string; isTyping: boolean }) => void;
}

export function useSocket(roomId: string | undefined, events: SocketEvents) {
  const { onNewMessage, onUserJoined, onUserLeft, onUserTyping } = events;

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !roomId) return;

    socketService.joinRoom(roomId);

    if (onNewMessage) {
      socket.on('newMessage', onNewMessage);
    }
    if (onUserJoined) {
      socket.on('userJoined', onUserJoined);
    }
    if (onUserLeft) {
      socket.on('userLeft', onUserLeft);
    }
    if (onUserTyping) {
      socket.on('userTyping', onUserTyping);
    }

    return () => {
      socketService.leaveRoom(roomId);
      socket.off('newMessage');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userTyping');
    };
  }, [roomId, onNewMessage, onUserJoined, onUserLeft, onUserTyping]);

  const sendMessage = useCallback(
    (content: string) => {
      if (roomId) {
        socketService.sendMessage(roomId, content);
      }
    },
    [roomId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (roomId) {
        socketService.sendTyping(roomId, isTyping);
      }
    },
    [roomId]
  );

  return { sendMessage, sendTyping };
}
