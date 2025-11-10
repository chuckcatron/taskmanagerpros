export interface User {
  userId: string; // Cognito User ID (sub)
  email: string;
  name?: string;
  accountType: 'individual' | 'team' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  userId: string;
  email: string;
  name?: string;
  accountType?: 'individual' | 'team' | 'enterprise';
}

export interface UpdateUserInput {
  name?: string;
  accountType?: 'individual' | 'team' | 'enterprise';
}
