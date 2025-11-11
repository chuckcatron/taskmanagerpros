/**
 * Script to create DynamoDB tables for Task Manager Pro
 *
 * Usage:
 *   npx ts-node scripts/create-dynamodb-tables.ts
 *
 * Environment variables required:
 *   - AWS_REGION or NEXT_PUBLIC_AWS_REGION
 *   - AWS credentials should be configured (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 *     or use AWS CLI profile
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';

const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const tableName = process.env.DYNAMODB_USERS_TABLE || 'TaskManagerPro-Users';

const client = new DynamoDBClient({ region });

async function tableExists(name: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createUsersTable() {
  const exists = await tableExists(tableName);

  if (exists) {
    console.log(`✓ Table ${tableName} already exists`);
    return;
  }

  console.log(`Creating table ${tableName}...`);

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  try {
    await client.send(command);
    console.log(`✓ Table ${tableName} created successfully`);
    console.log(`  Partition Key: userId (String)`);
    console.log(`  GSI: EmailIndex on email`);
  } catch (error: any) {
    console.error(`✗ Failed to create table ${tableName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('DynamoDB Table Setup');
  console.log('===================');
  console.log(`Region: ${region}`);
  console.log('');

  try {
    await createUsersTable();
    console.log('');
    console.log('✓ All tables created successfully!');
    console.log('');
    console.log('Environment variables for .env.local:');
    console.log(`DYNAMODB_USERS_TABLE=${tableName}`);
    console.log(`AWS_REGION=${region}`);
  } catch (error) {
    console.error('Failed to create tables:', error);
    process.exit(1);
  }
}

main();
