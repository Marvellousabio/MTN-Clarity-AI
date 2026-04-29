
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

RESOURCE_GROUP="${RESOURCE_GROUP:-ai-rg}"
LOCATION="${LOCATION:-eastus}"

COSMOS_TEMPLATE="$SCRIPT_DIR/../modules/cosmos.bicep"
MONITORING_TEMPLATE="$SCRIPT_DIR/../modules/monitoring.bicep"
ENVIRONMENT="${ENVIRONMENT:-dev}"
COSMOS_ACCOUNT_NAME="${COSMOS_ACCOUNT_NAME:-clarity-cosmos-$(date +%s)}"
COSMOS_DB_NAME="${COSMOS_DB_NAME:-clarityai}"
APP_INSIGHTS_NAME="${APP_INSIGHTS_NAME:-clarity-insights-$(date +%s)}"

echo -e "${YELLOW}Deploying Cosmos + Monitoring to resource group: $RESOURCE_GROUP${NC}"

if ! command -v az &> /dev/null; then
  echo -e "${RED}Azure CLI not found${NC}"
  exit 1
fi

if ! az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1; then
  echo -e "${RED}Resource group '$RESOURCE_GROUP' does not exist${NC}"
  exit 1
fi

# Deploy monitoring first
echo -e "\n${YELLOW}Deploying monitoring...${NC}"
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$MONITORING_TEMPLATE" \
  --parameters \
    location="$LOCATION" \
    appInsightsName="$APP_INSIGHTS_NAME" \
    environment="$ENVIRONMENT" \
    logAnalyticsRetentionDays=30 \
  --name "monitoring-$(date +%s)"

echo -e "${GREEN}✓ Monitoring deployed${NC}"

# Deploy cosmos second
echo -e "\n${YELLOW}Deploying cosmos...${NC}"
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$COSMOS_TEMPLATE" \
  --parameters \
    location="$LOCATION" \
    accountName="$COSMOS_ACCOUNT_NAME" \
    databaseName="$COSMOS_DB_NAME" \
    environment="$ENVIRONMENT" \
    throughput=400 \
  --name "cosmos-$(date +%s)"

echo -e "${GREEN}✓ Cosmos deployed${NC}"
echo -e "${GREEN}Done.${NC}"