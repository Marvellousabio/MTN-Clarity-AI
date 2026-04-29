/*
Cosmos DB module for MTN ClarityAI.
*/

param location string
param accountName string
param databaseName string
param environment string

// Container configuration
var containers = [
  {
    name: 'plans'
    partitionKey: '/id'
  }
  {
    name: 'profiles'
    partitionKey: '/id'
  }
  {
    name: 'usage'
    partitionKey: '/id'
  }
  {
    name: 'auth_users'
    partitionKey: '/id'
  }
  {
    name: 'chat_sessions'
    partitionKey: '/id'
  }
]

// Cosmos DB Serverless Account
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: accountName
  location: location
  kind: 'GlobalDocumentDB'
  tags: {
    environment: environment
    module: 'cosmos'
  }
  properties: {
    databaseAccountOfferType: 'Serverless'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
      maxIntervalInSeconds: 5
      maxStalenessPrefix: 100
    }
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

// Database
resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

// Containers
resource containers_resource 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [
  for container in containers: {
    parent: database
    name: container.name
    properties: {
      resource: {
        id: container.name
        partitionKey: {
          paths: [
            container.partitionKey
          ]
          kind: 'Hash'
        }
        indexingPolicy: {
          indexingMode: 'consistent'
          automatic: true
          includedPaths: [
            {
              path: '/*'
            }
          ]
          excludedPaths: [
            {
              path: '/"_etag"/?'
            }
          ]
        }
        defaultTtl: 2592000  // 30 days for session/chat data auto-cleanup
      }
    }
  }
]

// Outputs
output endpoint string = cosmosAccount.properties.documentEndpoint
output masterKey string = listKeys(cosmosAccount.id, cosmosAccount.apiVersion).primaryMasterKey
output databaseName string = databaseName
output containerNames object = {
  plans: 'plans'
  profiles: 'profiles'
  usage: 'usage'
  authUsers: 'auth_users'
  chatSessions: 'chat_sessions'
}
