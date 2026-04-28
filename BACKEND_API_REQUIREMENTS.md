# MTN ClarityAI Frontend Requirements for Backend Integration

This document outlines all the backend APIs, data structures, and services that the frontend requires to function properly. The frontend is currently using mock data but needs to be connected to live backend services.

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core API Endpoints](#core-api-endpoints)
4. [AI Chatbox Integration](#ai-chatbox-integration)
5. [Data Structures](#data-structures)
6. [Real-time Features](#real-time-features)
7. [Error Handling](#error-handling)
8. [Performance Requirements](#performance-requirements)

## Overview

The MTN ClarityAI frontend is a React application that helps users understand and optimize their MTN Nigeria mobile plans. Key features include:
- Plan comparison and recommendation engine
- AI-powered chatbot assistant (ClarityAI)
- Usage analytics and savings projections
- Multi-language support (English, Pidgin, Hausa, Yoruba, Igbo)

## Authentication

Currently, the frontend does not implement authentication as it uses mock user data. However, for production, the following authentication endpoints will be needed:

### Required Endpoints:
- `POST /api/auth/login` - User login with phone number/email and password
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/register` - New user registration (optional)
- `GET /api/auth/me` - Get current user profile

### Expected Response Format:
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "string",
    "name": "string",
    "phoneNumber": "string",
    "email": "string",
    "currentPlanId": "string",
    "monthlySpend": "number",
    "dataBurnRate": "Low|Medium|High",
    "heavySocialUsage": "boolean",
    "preferredLanguage": "EN|PIDGIN|HA|YO|IG"
  }
}
```

## Core API Endpoints

### 1. User Profile & Plans

#### GET /api/user/profile
Retrieve the authenticated user's profile and current plan information.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "currentPlanId": "string",
  "monthlySpend": number,
  "dataBurnRate": "Low" | "Medium" | "High",
  "heavySocialUsage": boolean,
  "preferredLanguage": "EN" | "PIDGIN" | "HA" | "YO" | "IG",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

#### GET /api/plans
Retrieve all available MTN plans with details.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "category": "string",
    "monthlyCost": number,
    "dataGB": number,
    "callMinutes": number,
    "smsCount": number,
    "validityDays": number,
    "activationCode": string,
    "summary": string,
    "features": ["string"],
    "bestFor": "string",
    "limitations": "string",
    "competitors": ["string"],
    "upsellTo": "string | null",
    "matchScore": number
  }
]
```

#### GET /api/plans/:planId
Retrieve details for a specific plan.

**Response:** Same as individual plan object in the plans array above.

#### POST /api/plans/compare
Compare multiple plans side-by-side.

**Request Body:**
```json
{
  "planIds": ["string"]
}
```

**Response:**
```json
{
  "comparison": {
    "features": ["string"],
    "plans": [
      {
        "planId": "string",
        "values": ["string | number"]
      }
    ],
    "highlightedDifferences": ["string"],
    "recommendation": {
      "recommendedPlanId": "string",
      "reason": "string",
      "savings": number
    }
  }
}
```

### 2. Usage Analytics

#### GET /api/usage/current
Get current month's usage statistics.

**Response:**
```json
{
  "totalDataUsed": number, // in GB
  "totalCallMinutes": number,
  "totalSmsSent": number,
  "usageByCategory": [
    {
      "category": "string",
      "percentage": number,
      "color": string // hex color
    }
  ],
  "dataBurnRate": "Low" | "Medium" | "High",
  "projectedOverage": {
    "data": number, // GB
    "cost": number // Naira
  }
}
```

#### GET /api/usage/history?period=month&limit=6
Get historical usage data.

**Response:**
```json
[
  {
    "period": "string", // e.g., "2026-03"
    "dataUsed": number,
    "callMinutes": number,
    "smsSent": number,
    "totalCost": number,
    "planId": "string"
  }
]
```

### 3. Savings & Recommendations

#### GET /api/recommendations
Get personalized plan recommendations based on usage.

**Response:**
```json
[
  {
    "planId": "string",
    "matchScore": number,
    "estimatedMonthlyCost": number,
    "estimatedSavings": number,
    "reason": "string",
    "activationCode": string,
    "switchProcess": {
      "steps": ["string"],
      "estimatedTime": "string"
    }
  }
]
```

#### POST /api/savings/calculate
Calculate potential savings from switching plans.

**Request Body:**
```json
{
  "currentPlanId": "string",
  "targetPlanId": "string"
}
```

**Response:**
```json
{
  "monthlySavings": number,
  "annualSavings": number,
  "dataChange": number, // GB
  "callChange": number, // minutes
  "smsChange": number,
  "breakEvenDate": "ISO date string"
}
```

## AI Chatbox Integration

The AI chatbot (ClarityAI) is a core feature requiring specific backend integration.

### Required Endpoints:

#### POST /api/chat/message
Send a message to the AI assistant and get a response.

**Request Body:**
```json
{
  "message": "string",
  "language": "EN" | "PIDGIN" | "HA" | "YO" | "IG",
  "context": {
    "userProfile": {
      "name": "string",
      "currentPlanId": "string",
      "monthlySpend": number,
      "dataBurnRate": "Low" | "Medium" | "High",
      "heavySocialUsage": boolean
    },
    "recentMessages": [ // optional, last 5 messages for context
      {
        "role": "user" | "ai",
        "text": "string",
        "timestamp": "ISO date string"
      }
    ]
  }
}
```

**Response:**
```json
{
  "id": "string",
  "role": "ai",
  "text": "string",
  "timestamp": "ISO date string",
  "suggestions": ["string"], // suggested follow-up questions
  "actions": [ // optional suggested actions
    {
      "type": "plan_change" | "usage_analysis" | "comparison",
      "payload": {} // action-specific data
    }
  ]
}
```

### AI Response Requirements:

1. **Language Support**: The AI must respond in the same language as the query (EN, PIDGIN, HA, YO, IG)
2. **Context Awareness**: Should reference user's current plan, usage patterns, and conversation history
3. **Actionable Suggestions**: Provide relevant follow-up questions based on the conversation
4. **Plan Recommendations**: When appropriate, suggest specific plan changes with activation codes
5. **Usage Analysis**: Ability to analyze usage patterns and provide insights
6. **Comparison Assistance**: Help users compare different plans based on their needs

### Example AI Interactions:

**User**: "Why does my data finish fast?" (English)
**AI**: Should analyze usage data, identify high-consumption apps, and suggest solutions like "You spend 62% of your data on social apps. A Pulse Plus plan might help."

**User**: "Data dey finish fast?" (Pidgin)
**AI**: Should respond in Pidgin with similar analysis: "You dey use 62% of data for TikTok and Instagram. Pulse Plus go save you better money!"

## Data Structures

### Language Type
```typescript
type Language = 'EN' | 'PIDGIN' | 'HA' | 'YO' | 'IG';
```

### ChatMessage Interface
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}
```

### UserProfile Interface
```typescript
interface UserProfile {
  id: string;
  name: string;
  currentPlanId: string;
  monthlySpend: number;
  dataBurnRate: 'Low' | 'Medium' | 'High';
  heavySocialUsage: boolean;
  preferredLanguage: Language;
}
```

### Plan Interface
```typescript
interface Plan {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  dataGB: number;
  callMinutes: number;
  smsCount: number;
  validityDays: number;
  activationCode: string;
  summary: string;
  features: string[];
  bestFor: string;
  limitations: string;
  competitors: string[];
  upsellTo: string | null;
  matchScore: number;
}
```

### UsageData Interface
```typescript
interface UsageData {
  category: string;
  percentage: number;
  color: string;
}
```

## Real-time Features

While not currently implemented, the frontend is designed to support:

### WebSocket Connection
- `wss://api.mtn-clarityai.com/ws` - For real-time usage updates
- Message types:
  - `usage_update`: When significant usage thresholds are reached
  - `plan_expiry_warning`: 3 days before plan renewal
  - `promotional_offer`: Personalized plan offers
  - `network_status`: MTN network announcements

### Expected WebSocket Message Format:
```json
{
  "type": "string",
  "payload": {},
  "timestamp": "ISO date string"
}
```

## Error Handling

All API endpoints should follow this error response format:

```json
{
  "error": {
    "code": "string", // e.g., "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"
    "message": "string",
    "details": {} // optional additional info
  }
}
```

### HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

## Performance Requirements

1. **Response Times**:
   - API endpoints: < 500ms for 95% of requests
   - Chat responses: < 1500ms (to match current simulated delay)
   - Plan comparisons: < 800ms

2. **Rate Limiting**:
   - Auth endpoints: 5 requests/minute per IP
   - API endpoints: 60 requests/minute per user
   - Chat endpoints: 30 requests/minute per user

3. **Caching**:
   - Plan data: Cache for 24 hours (plans change infrequently)
   - User profile: Cache for 5 minutes
   - Usage data: No cache (real-time preferred)

4. **Concurrency**:
   - Support for at least 1000 concurrent users
   - WebSocket support for 5000 concurrent connections

## Security Requirements

1. **Authentication**: JWT-based authentication with refresh token rotation
2. **Authorization**: Role-based access control (user/admin)
3. **Data Protection**:
   - Encrypt PII at rest
   - TLS 1.3 for all API communications
   - Regular security audits
4. **Input Validation**: All inputs must be validated and sanitized
5. **Rate Limiting**: Prevent abuse and DDoS attacks
6. **Logging**: Comprehensive audit logging for all API access

## Implementation Priority

1. **High Priority**:
   - User profile and authentication endpoints
   - Plans data endpoints
   - Chat API endpoint
   - Usage analytics endpoints

2. **Medium Priority**:
   - Recommendation engine
   - Savings calculation
   - Plan comparison
   - Historical usage

3. **Low Priority**:
   - Real-time WebSocket features
   - Advanced analytics
   - Administrative endpoints

## Testing Requirements

Backend should provide:
1. API documentation (OpenAPI/Swagger format)
2. Postman collection or equivalent
3. Test credentials for development/staging environments
4. Load test results showing performance benchmarks
5. Security assessment report

## Contact Information

For questions about these requirements, please contact:
- Frontend Team Lead: [Name/Contact]
- Product Owner: [Name/Contact]
- UX Designer: [Name/Contact]

Last Updated: April 28, 2026
Version: 1.0