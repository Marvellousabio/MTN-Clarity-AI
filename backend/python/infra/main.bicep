/*
Main orchestrator for MTN ClarityAI infrastructure.
*/

targetScope = 'resourceGroup'

param location string = resourceGroup().location
param environment string = 'prod'
param projectName string = 'clarityai'

// Cosmos DB parameters
param cosmosAccountName string
param cosmosDatabaseName string = 'clarityai'

// OpenAI parameters
param openAiAccountName string
param openAiDeploymentName string = 'clarity-chat'
param openAiModelName string = 'gpt-4o-mini'
param openAiModelVersion string = '2024-10-21'
param openAiCapacity int = 10

// Monitoring parameters
param appInsightsName string = '${projectName}-insights-${environment}'
param logAnalyticsRetentionDays int = 30

// Deploy Cosmos DB (serverless for cost optimization)
module cosmos './modules/cosmos.bicep' = {
  name: 'cosmos-deployment'
  params: {
    location: location
    accountName: cosmosAccountName
    databaseName: cosmosDatabaseName
    environment: environment
  }
}

// Deploy Azure OpenAI (cost-effective gpt-4o-mini)
module openAi './modules/openai.bicep' = {
  name: 'openai-deployment'
  params: {
    location: location
    accountName: openAiAccountName
    deploymentName: openAiDeploymentName
    modelName: openAiModelName
    modelVersion: openAiModelVersion
    capacity: openAiCapacity
    environment: environment
  }
}

// Deploy monitoring (Application Insights + Log Analytics)
module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    location: location
    appInsightsName: appInsightsName
    logAnalyticsRetentionDays: logAnalyticsRetentionDays
    environment: environment
  }
}

// Outputs for application configuration
output cosmosEndpoint string = cosmos.outputs.endpoint
output cosmosMasterKey string = cosmos.outputs.masterKey
output cosmosDatabase string = cosmosDatabaseName
output cosmosContainers object = cosmos.outputs.containerNames
output openAiEndpoint string = openAi.outputs.endpoint
output openAiKey string = openAi.outputs.key
output openAiDeployment string = openAiDeploymentName
output appInsightsInstrumentationKey string = monitoring.outputs.instrumentationKey
output appInsightsConnectionString string = monitoring.outputs.connectionString
