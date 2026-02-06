export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  members: RoomMember[];
  _count?: {
    messages: number;
  };
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}
