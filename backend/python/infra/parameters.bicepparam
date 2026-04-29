using './main.bicep'

// Environment setup
param location = 'eastus' 
param environment = 'prod'
param projectName = 'clarityai'

// Cosmos DB - must be globally unique
param cosmosAccountName = 'cosmos-clarityai-${uniqueString(resourceGroup().id)}'
param cosmosDatabaseName = 'clarityai'

// Azure OpenAI - must be globally unique
param openAiAccountName = 'openai-clarityai-${uniqueString(resourceGroup().id)}'
param openAiDeploymentName = 'clarity-chat'
param openAiModelName = 'gpt-4o-mini'
param openAiModelVersion = '2024-10-21'
param openAiCapacity = 10 

// Monitoring
param appInsightsName = 'clarityai-insights-${environment}'
param logAnalyticsRetentionDays = 30
