# MTN ClarityAI Infrastructure Deployment

This directory contains modular Bicep templates for deploying MTN ClarityAI infrastructure to Azure with a focus on cost optimization.

## Architecture Overview

The infrastructure is organized into reusable modules:

- **cosmos.bicep** - Cosmos DB Serverless account with containers for data persistence
- **openai.bicep** - Azure OpenAI service with gpt-4o-mini deployment
- **monitoring.bicep** - Application Insights and Log Analytics for observability
- **main.bicep** - Orchestrator that deploys all modules

## Cost Optimization

### Free Tier Benefits

| Service                  | Free Tier         | Details                                             |
| ------------------------ | ----------------- | --------------------------------------------------- |
| **Cosmos DB Serverless** | 1,000 RU/s/month  | Auto-scales, pay-as-you-go after free tier          |
| **Application Insights** | 5 GB/month ingest | Log retention configured for 30 days                |
| **Log Analytics**        | Pay-per-GB        | Integrated with App Insights for unified monitoring |
| **Azure OpenAI**         | None              | Tokens-based pricing; gpt-4o-mini is cost-efficient |

### Estimated Monthly Cost (Low-Traffic Scenario)

- **Cosmos DB**: $0 (within free tier for typical development)
- **Azure OpenAI**: ~$10-50 (gpt-4o-mini at ~$0.15 per 1M input + $0.60 per 1M output tokens)
- **Application Insights**: $0-5 (within free 5GB/month)
- **Log Analytics**: $0-2 (minimal traffic)

**Total: ~$10-60/month for typical low-traffic usage**

> Costs scale with traffic. Monitor usage in Azure Portal and adjust Cosmos serverless limits or OpenAI capacity as needed.

## Prerequisites

1. Azure subscription with sufficient credits/quota
2. Azure CLI or Bicep CLI installed
3. Appropriate RBAC permissions (Contributor or resource-specific roles)

## Deployment

### Option 1: Using Azure CLI

```bash
cd backend/python/infra

# Set variables
RESOURCE_GROUP="clarityai-rg"
LOCATION="eastus"

# Create resource group if it doesn't exist
az group create --name $RESOURCE_GROUP --location $LOCATION

# Validate the template
az deployment group validate \
  --resource-group $RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters parameters.bicepparam

# Deploy
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters parameters.bicepparam

# Retrieve outputs
az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs
```

### Option 2: Using Azure Portal

1. Go to **Resource Groups** → Create new or select existing
2. Click **Deploy a custom template**
3. Select **Build your own template in the editor**
4. Copy contents of `main.bicep` and paste
5. Click **Save** and proceed with parameters
6. Review and create

## Configuration

After deployment, configure your FastAPI backend with the output values:

```bash
# Retrieve connection strings from deployment outputs
export CLARITY_COSMOS_ENDPOINT=$(az deployment group show --resource-group $RESOURCE_GROUP --name main --query "properties.outputs.cosmosEndpoint.value" -o tsv)
export CLARITY_COSMOS_KEY=$(az deployment group show --resource-group $RESOURCE_GROUP --name main --query "properties.outputs.cosmosMasterKey.value" -o tsv)
export CLARITY_AZURE_OPENAI_ENDPOINT=$(az deployment group show --resource-group $RESOURCE_GROUP --name main --query "properties.outputs.openAiEndpoint.value" -o tsv)
export CLARITY_AZURE_OPENAI_KEY=$(az deployment group show --resource-group $RESOURCE_GROUP --name main --query "properties.outputs.openAiKey.value" -o tsv)
```

Update your `.env` file in `backend/python/`:

```
CLARITY_COSMOS_ENDPOINT=<from-outputs>
CLARITY_COSMOS_KEY=<from-outputs>
CLARITY_COSMOS_DATABASE=clarityai
CLARITY_COSMOS_PLANS_CONTAINER=plans
CLARITY_COSMOS_PROFILES_CONTAINER=profiles
CLARITY_COSMOS_USAGE_CONTAINER=usage
CLARITY_COSMOS_AUTH_CONTAINER=auth_users
CLARITY_COSMOS_CHAT_CONTAINER=chat_sessions

CLARITY_AZURE_OPENAI_ENDPOINT=<from-outputs>
CLARITY_AZURE_OPENAI_KEY=<from-outputs>
CLARITY_AZURE_OPENAI_DEPLOYMENT=clarity-chat

CLARITY_JWT_SECRET=<generate-a-strong-secret>
```

## Module Details

### Cosmos DB Module (`cosmos.bicep`)

**Serverless Pricing Model:**

- Automatically scales based on demand
- No provisioned capacity required
- Includes 1,000 RU/s per month free

**Containers:**

- `plans` - Store MTN plan catalog
- `profiles` - User profile and preference data
- `usage` - Usage analytics snapshots
- `auth_users` - Authentication accounts and tokens
- `chat_sessions` - Chat conversation history and Semantic Kernel memory

**TTL Policy:** 30 days on session/chat data for automatic cleanup

**New in v2.0:** The `chat_sessions` container now supports Semantic Kernel integration. When the backend's SK orchestration is enabled, conversation history is persisted here for multi-turn context and memory recall. Each session is identified by a `session_id` and partitioned by its `id` field.

### OpenAI Module (`openai.bicep`)

**Model Choice: gpt-4o-mini**

- Cost-effective for chat, recommendations, and text generation
- Supports function calling and structured outputs
- Suitable for MTN plan explanations and recommendations

**Capacity:** 10 TPM (tokens per minute) - adjust if higher throughput needed

### Monitoring Module (`monitoring.bicep`)

**Log Analytics:**

- 30-day retention (adjustable per cost requirements)
- Centralized logging for all services

**Application Insights:**

- Request/response telemetry
- Performance counters
- Custom events from backend services

## Customization

### Change Deployment Region

Update `parameters.bicepparam`:

```bicepparam
param location = 'westeurope'  // or your preferred region
```

### Adjust Log Retention

```bicepparam
param logAnalyticsRetentionDays = 7  // Shorter retention = lower cost
```

### Scale OpenAI Capacity

```bicepparam
param openAiCapacity = 20  // Increase for higher throughput
```

## Scaling Up from Free Tier

When traffic increases and you exceed free tier limits:

### Cosmos DB

1. Consider provisioned throughput for predictable costs
2. Set min/max RU/s for auto-scaling
3. Example: Switch to provisioned with 400 RU/s minimum

### Azure OpenAI

1. Increase capacity parameter
2. Monitor token usage in Azure Portal
3. Consider rate limiting if costs spike

### Application Insights

1. Reduce retention days if storage costs increase
2. Use sampling for high-volume scenarios
3. Create alerts for cost anomalies

## Monitoring & Cost Alerts

### Semantic Kernel Data Volume

When SK integration is enabled (v2.0+), the `chat_sessions` container stores conversation history. Monitor this to account for storage:

- **Per-session data:** ~1-2 KB per message (messages + timestamps)
- **TTL cleanup:** Automatic after 30 days
- **Throughput:** Typically minimal (well within free tier for typical usage)

Check Cosmos DB metrics in Azure Portal → Storage → Collections → chat_sessions to verify volume.

Set up cost alerts in Azure:

1. Go to **Cost Management + Billing**
2. **Budgets** → Create budget
3. Set threshold (e.g., $50/month)
4. Configure notifications

## Cleanup

To remove all resources and stop incurring charges:

```bash
az group delete --name clarityai-rg --yes
```

## Troubleshooting

### Deployment Fails with "Subscription Quota Exceeded"

- Check regional quotas in Azure Portal
- Try a different region
- Contact Azure Support for quota increase

### Cosmos DB Connection Timeout

- Verify Cosmos DB firewall allows your IP
- Update `publicNetworkAccessForIngestion` in cosmos.bicep if needed

### OpenAI Rate Limiting

- Increase capacity parameter
- Implement exponential backoff in backend
- Monitor token usage dashboard

## Support

For issues with:

- **Bicep syntax**: See [Azure Bicep documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- **Cost optimization**: Review [Azure pricing calculator](https://azure.microsoft.com/pricing/calculator/)
- **Backend integration**: Check `/backend/python/README.md`
