import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Lazy-load DynamoDB client to avoid initialization errors at build time
let _client: DynamoDBClient | null = null;
let _dynamoDb: DynamoDBDocumentClient | null = null;

function getClient(): DynamoDBClient {
  if (!_client) {
    const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION;

    if (!region) {
      throw new Error(
        'AWS_REGION or NEXT_PUBLIC_AWS_REGION environment variable is required'
      );
    }

    _client = new DynamoDBClient({ region });
  }
  return _client;
}

// Create a DynamoDB Document client for easier operations
export function getDynamoDb(): DynamoDBDocumentClient {
  if (!_dynamoDb) {
    _dynamoDb = DynamoDBDocumentClient.from(getClient());
  }
  return _dynamoDb;
}

// Table names
export const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'TaskManagerPro-Users';
