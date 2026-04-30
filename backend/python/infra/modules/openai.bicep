/*
Azure OpenAI module for MTN ClarityAI.

Uses gpt-4o-mini which is the most cost-effective model from OpenAI
with strong performance for chat and recommendations.
*/

param location string
param accountName string
param deploymentName string
param modelName string
param modelVersion string
param capacity int = 10
param environment string

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2024-10-01-preview' = {
  name: accountName
  location: location
  kind: 'OpenAI'
  tags: {
    environment: environment
    module: 'openai'
  }
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: accountName
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource deployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01-preview' = {
  parent: openAiAccount
  name: deploymentName
  properties: {
    model: {
      format: 'OpenAI'
      name: modelName
      version: modelVersion
    }
    scaleSettings: {
      scaleType: 'Standard'
      capacity: capacity
    }
  }
}

output endpoint string = openAiAccount.properties.endpoint
output key string = listKeys(openAiAccount.id, openAiAccount.apiVersion).key1
output deploymentName string = deploymentName
output modelName string = modelName
