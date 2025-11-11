import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDb, USERS_TABLE } from './dynamodb';
import type { User, CreateUserInput, UpdateUserInput } from './types';

/**
 * Get a user by their userId (Cognito sub)
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const dynamoDb = getDynamoDb();
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    );

    return (result.Item as User) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    // Return null if AWS is not configured (e.g., during build)
    if (error instanceof Error && error.message.includes('environment variable')) {
      return null;
    }
    throw new Error('Failed to get user');
  }
}

/**
 * Create a new user record
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    userId: input.userId,
    email: input.email,
    name: input.name,
    accountType: input.accountType || 'individual',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const dynamoDb = getDynamoDb();
    await dynamoDb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)', // Prevent overwriting existing users
      })
    );

    return user;
  } catch (error: any) {
    // Handle ConditionalCheckFailedException (user already exists)
    if (error.name === 'ConditionalCheckFailedException') {
      return user;
    }
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Update a user's profile
 */
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
  const updates: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  // Build update expression dynamically
  if (input.name !== undefined) {
    updates.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = input.name;
  }

  if (input.accountType !== undefined) {
    updates.push('#accountType = :accountType');
    expressionAttributeNames['#accountType'] = 'accountType';
    expressionAttributeValues[':accountType'] = input.accountType;
  }

  // Always update the updatedAt timestamp
  updates.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  if (updates.length === 1) {
    // Only updatedAt would be updated, which means no actual changes
    const user = await getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  try {
    const dynamoDb = getDynamoDb();
    const result = await dynamoDb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as User;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Get or create a user (for use during sign-in)
 */
export async function getOrCreateUser(input: CreateUserInput): Promise<User> {
  try {
    // Try to get existing user
    const existingUser = await getUser(input.userId);
    if (existingUser) {
      return existingUser;
    }

    // Create new user if doesn't exist
    return await createUser(input);
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}
