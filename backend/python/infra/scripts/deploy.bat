@echo off
REM MTN ClarityAI Infrastructure Deployment Script for Windows
REM Automates Azure resource deployment with validation and output capture

setlocal enabledelayedexpansion

REM Configuration
if not defined RESOURCE_GROUP set RESOURCE_GROUP=clarityai-rg
if not defined LOCATION set LOCATION=eastus

set DEPLOYMENT_NAME=clarityai-deployment-%random%

echo ========================================
echo MTN ClarityAI Infrastructure Deployment
echo ========================================

REM Check prerequisites
echo.
echo Checking prerequisites...

where az >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Azure CLI not found. Install from: https://aka.ms/azure-cli
    exit /b 1
)

az account show >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Not logged in. Running: az login
    call az login
)

REM Get subscription info
for /f "delims=" %%a in ('az account show --query name -o tsv') do set SUBSCRIPTION=%%a
for /f "delims=" %%a in ('az account show --query id -o tsv') do set SUBSCRIPTION_ID=%%a
echo Using subscription: %SUBSCRIPTION% (ID: %SUBSCRIPTION_ID%)

REM Create resource group
echo.
echo Creating resource group: %RESOURCE_GROUP%...
call az group create --name "%RESOURCE_GROUP%" --location "%LOCATION%" >nul
echo Resource group ready

REM Validate template
echo.
echo Validating Bicep template...
call az deployment group validate ^
    --resource-group "%RESOURCE_GROUP%" ^
    --template-file main.bicep ^
    --parameters parameters.bicepparam >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Template validation passed
) else (
    echo ERROR: Template validation failed
    exit /b 1
)

REM Deploy
echo.
echo Deploying infrastructure (this may take 5-10 minutes)...
call az deployment group create ^
    --name "%DEPLOYMENT_NAME%" ^
    --resource-group "%RESOURCE_GROUP%" ^
    --template-file main.bicep ^
    --parameters parameters.bicepparam ^
    --output json > deployment-output.json

if %ERRORLEVEL% EQU 0 (
    echo Deployment completed successfully
) else (
    echo ERROR: Deployment failed
    exit /b 1
)

REM Extract outputs and create env file
echo.
echo Creating .env file for backend...

for /f "delims=" %%a in ('jq -r ".properties.outputs.cosmosEndpoint.value" deployment-output.json') do set COSMOS_ENDPOINT=%%a
for /f "delims=" %%a in ('jq -r ".properties.outputs.cosmosMasterKey.value" deployment-output.json') do set COSMOS_KEY=%%a
for /f "delims=" %%a in ('jq -r ".properties.outputs.openAiEndpoint.value" deployment-output.json') do set OPENAI_ENDPOINT=%%a
for /f "delims=" %%a in ('jq -r ".properties.outputs.openAiKey.value" deployment-output.json') do set OPENAI_KEY=%%a

(
    echo # Generated environment file
    echo CLARITY_COSMOS_ENDPOINT=%COSMOS_ENDPOINT%
    echo CLARITY_COSMOS_KEY=%COSMOS_KEY%
    echo CLARITY_COSMOS_DATABASE=clarityai
    echo CLARITY_COSMOS_PLANS_CONTAINER=plans
    echo CLARITY_COSMOS_PROFILES_CONTAINER=profiles
    echo CLARITY_COSMOS_USAGE_CONTAINER=usage
    echo CLARITY_COSMOS_AUTH_CONTAINER=auth_users
    echo CLARITY_COSMOS_CHAT_CONTAINER=chat_sessions
    echo CLARITY_AZURE_OPENAI_ENDPOINT=%OPENAI_ENDPOINT%
    echo CLARITY_AZURE_OPENAI_KEY=%OPENAI_KEY%
    echo CLARITY_AZURE_OPENAI_DEPLOYMENT=clarity-chat
) > .env.azure

echo Environment file created: .env.azure

REM Display summary
echo.
echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Deployment Summary:
echo   Resource Group: %RESOURCE_GROUP%
echo   Location: %LOCATION%
echo.
echo Resources Created:
echo   - Cosmos DB Serverless Account
echo   - Azure OpenAI Service
echo   - Application Insights
echo   - Log Analytics Workspace
echo.
echo Next Steps:
echo   1. Copy .env.azure to backend\python\.env
echo   2. Configure backend with these credentials
echo   3. Test connections
echo.
echo To clean up all resources:
echo   az group delete --name %RESOURCE_GROUP% --yes
