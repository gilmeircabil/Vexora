# Centralized Usage Limits & Resource Protection System Design

**Date:** 2026-11-05  
**Author:** Claude Code  
**Version:** 1.0

## Executive Summary

This document describes the design for a centralized Global Usage Limits and Resource Protection System for the VexoraMods platform. The system protects the platform against abuse, excessive resource consumption, spam, automated attacks, and unexpected infrastructure costs while keeping VexoraMods free and accessible to everyone.

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Components](#2-core-components)
3. [Data Models](#3-data-models)
4. [Limit Configuration](#4-limit-configuration)
5. [Middleware & Enforcement](#5-middleware--enforcement)
6. [API Endpoints](#6-api-endpoints)
7. [Admin Dashboard Integration](#7-admin-dashboard-integration)
8. [Frontend Integration](#8-frontend-integration)
9. [Security Considerations](#9-security-considerations)
10. [Migration Plan](#10-migration-plan)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Usage Indicators  │  Error Messages  │  Rate Limit UI   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    API GATEWAY                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Global Limit Middleware  │  Authentication Middleware │  │
│  │  - enforceLimits()         │  - protectRoutes()         │  │
│  │  - trackUsage()            │  - requireAuth()           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ AI Tools    │ │ Learning    │ │ Design      │ │ Auth       ││
│  │             │ │ Hub         │ │ Studio      │ │            ││
│  │ - Rate      │ │ - Rate      │ │ - Rate      │ │ - Rate     ││
│  │   limited   │ │   limited   │ │   limited   │ │   limited  ││
│  │ - Concurrent│ │ - Concurrent│ │ - Quota     │ │ - Quota    ││
│  │   jobs      │ │   events    │ │   limits    │ │   limits   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    PERSISTENCE LAYER                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  MongoDB: UsageLimit Collection                         │  │
│  │  - Hourly/Daily/Monthly counters                        │  │
│  │  - Feature quotas                                       │  │
│  │  - Storage aggregation                                  │  │
│  │                                                         │  │
│  │  MongoDB: Enhanced existing models                      │  │
│  │  - User: storageQuota, usageStats                       │  │
│  │  - DesignProject: storageBytes                          │  │
│  │  - LearningPost: storageBytes                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components

### 2.1 Centralized Limit Configuration (`server/src/config/limits.ts`)

Single source of truth for all configurable limits. All values can be overridden via environment variables.

### 2.2 Usage Tracking Service (`server/src/services/limitService.ts`)

Core service for:
- Rate limit management
- Storage quota calculation and tracking
- Usage statistics aggregation
- Reset window calculations

### 2.3 Limit Enforcement Middleware (`server/src/middleware/limitMiddleware.ts`)

Express middleware for:
- Generic limit enforcement
- Usage tracking decorators
- Storage quota checks
- Response headers for rate limit information

### 2.4 Database Models
- `UsageLimit.ts` - New collection for tracking usage
- Enhanced `User.ts` - Added storage quota tracking

---

## 3. Data Models

### 3.1 UsageLimit Model (New Collection)

```typescript
export interface IUsageLimit {
  userId?: Types.ObjectId;           // For authenticated users
  ipAddress?: string;                 // For guest/rate limiting
  category: string;                   // 'auth', 'api', 'upload', 'ai', 'learning', 'studio', 'storage'
  action: string;                     // 'register', 'login', 'upload', 'enhance', etc.
  windowStart: Date;                  // When this window started
  count: number;                      // Current usage count
  limit: number;                      // Maximum allowed in window
  resetAt: Date;                      // When counter resets
  metadata?: Record<string, any>;     // Additional context (fileSize, toolType, etc.)
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 User Model Enhancement

```typescript
// Add to existing User schema
storageUsedBytes: { type: Number, default: 0, index: true },
storageQuotaBytes: { type: Number, default: 500 * 1024 * 1024 }, // 500 MB default

// Add usage tracking subdocument
usageStats: {
  hourly: { [key: string]: number },
  daily: { [key: string]: number },
  monthly: { [key: string]: number },
}
```

---

## 4. Limit Configuration

All limits are defined in `server/src/config/limits.ts` with environment variable overrides.

### 4.1 Authentication Limits

| Category | Limit | Window | Notes |
|----------|-------|--------|-------|
| Registrations | 3 | per hour per IP | Prevents spam account creation |
| Logins | 5 failed attempts | sliding window | Progressive delays after failures |
| Password Recovery | 5 | per hour per IP | Prevents enumeration attacks |

### 4.2 API Limits

| Category | Limit | Window | Notes |
|----------|-------|--------|-------|
| General API | 100 | per minute per user | Authenticated users |
| General API | 60 | per minute per IP | Guest users |
| Search | 60 | per minute | Public endpoints |
| File Uploads | 10 | per hour | Any authenticated user |

### 4.3 File Upload Limits

| Upload Type | Max Size | Storage Count |
|-------------|----------|---------------|
| Profile Avatar | 5 MB | Not counted toward quota |
| Learning Attachments | 25 MB | 500 MB monthly quota |
| Document-to-Quiz | 50 MB | 500 MB monthly quota |
| Design Assets | 25 MB each | 500 MB combined quota |
| Media Conversions | 100 MB | 1 GB monthly quota |

### 4.4 Tool Execution Limits

| Tool | Limit | Window | Notes |
|------|-------|--------|-------|
| AI Image Enhancer | 10 | per hour per user |
| AI Background Remover | 10 | per hour per user |
| AI OCR | 15 | per hour per user |
| Media Conversions (MP3) | 10 | per hour per user |
| Media Conversions (MP4) | 5 | per hour per user |
| Document-to-Quiz | 10 | per hour per user |
| Concurrent AI Jobs | 1 | per user | Only one active at a time |

### 4.5 Study Space Limits

| Feature | Limit | Notes |
|---------|-------|-------|
| Document-to-Quiz | 10 | per hour per user |
| Quiz Creation | 50 | per day per user |
| Flashcard Decks | 100 | per user |
| Quiz Attempts | 100 | per day per user |
| Quiz Questions Max | 50 | questions per generation |

### 4.6 Studio Limits

| Feature | Limit | Notes |
|---------|-------|-------|
| Saved Projects | 50 | per user |
| Combined Assets | 500 MB | shared quota |
| Exports | 20 | per hour per user |
| Concurrent Exports | 1 | per user |
| Project Size | 10 MB | document data limit |

### 4.7 Learning Hub Limits

| Feature | Limit | Window | Notes |
|---------|-------|--------|-------|
| Posts | 10 | per day per user | Community + learning combined |
| Comments | 30 | per hour per user | |
| Reviews | 3 | per day per user | One per learning material |
| Learning File Uploads | 25 MB | each | |
| Payout Requests | 1 | per day per creator | |

### 4.8 Community Limits

| Action | Limit | Window |
|--------|-------|--------|
| Posts | 10 | per day |
| Comments | 60 | per hour |
| Reactions/Likes | 60 | per hour |
| Reports | 10 | per hour |

### 4.9 Storage Quotas

| Quota Type | Default Value | Notes |
|------------|---------------|-------|
| Authenticated Users | 500 MB | Combined across all features |
| Temporary Files | 24 hours | Auto-cleanup |
| Total Platform | 9.5 GB | Cloudflare R2 safety cap |

---

## 5. Middleware & Enforcement

### 5.1 Global Limit Middleware (`server/src/middleware/limitMiddleware.ts`)

```typescript
interface LimitOptions {
  category: string;
  action: string;
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  onLimitExceeded?: (req: Request, res: Response) => void;
}

export function enforceLimits(options: LimitOptions) {
  // Implementation uses in-memory Map with periodic cleanup
  // Falls back to database aggregation for distributed systems
}
```

### 5.2 Storage Quota Checker

```typescript
export async function checkStorageQuota(
  userId: string,
  additionalBytes: number
): Promise<{ withinQuota: boolean; remainingBytes: number; currentUsage: number }> {
  // Query DesignAsset and LearningPost collections
  // Sum file sizes for user
  // Compare against quota
}
```

### 5.3 Usage Tracker Decorator

```typescript
export function trackUsage(category: string, action: string, valueGetter?: (req: any) => number) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Increment usage after successful operation
    // Store in MongoDB for persistence
  };
}
```

---

## 6. API Endpoints

### 6.1 Rate Limit Endpoints (New Routes)

```
GET    /api/limits/status                    # Get current user's limit status
GET    /api/limits/storage                   # Get storage usage details
POST   /api/limits/reset                     # Request usage reset (limited)
```

### 6.2 Admin Endpoints (New Routes under /api/admin)

```
GET    /api/admin/limits                     # List all configured limits
GET    /api/admin/limits/:category           # Get limits for a specific category
PATCH  /api/admin/limits/:category           # Update limits for a category
GET    /api/admin/usage                      # Get platform-wide usage statistics
GET    /api/admin/storage                    # Get storage usage breakdown
GET    /api/admin/jobs                       # Get active/queued processing jobs
GET    /api/admin/users/:id/usage            # Get specific user's usage
PATCH  /api/admin/users/:id/restrict         # Apply temporary restrictions
POST   /api/admin/jobs/:id/cancel            # Cancel a job
```

### 6.3 Modified Existing Endpoints

All existing endpoints will be updated to:
1. Include rate limit information in response headers
2. Return 429 status when limits exceeded
3. Include user-facing error messages

---

## 7. Admin Dashboard Integration

### 7.1 New Page: Global Usage & Resource Management

**Route:** `/admin/limits` (protected by admin auth)

**Sections:**
1. **Limits Overview** - Table of all configurable limits
2. **Usage Dashboard** - Charts showing:
   - API request volume (last 24 hours)
   - Storage usage by feature
   - Active processing jobs
   - Rate limit violations
3. **User Management** - Find excessive resource users
4. **Log Viewer** - Recent limit events
5. **Quick Actions** - Temporarily restrict accounts

### 7.2 Components

```tsx
// client/src/pages/admin/limits/AdminLimitsPage.tsx
// - LimitsConfiguration.tsx
// - UsageDashboard.tsx
// - UserQuotaManager.tsx
// - ViolationLog.tsx
```

---

## 8. Frontend Integration

### 8.1 Usage Indicator Component

```tsx
// Displays: "You have 12 remaining AI generations today"
// Shows progress bar for storage quota
// Shows reset timer for rate limits
```

### 8.2 Error Handling

- Global 429 error handler
- User-friendly messages: "You've reached the hourly limit. Try again in 15 minutes."
- Automatic retry with exponential backoff for transient limits

### 8.3 Response Headers

All responses will include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1698745200
```

---

## 9. Security Considerations

### 9.1 Defense in Depth

1. **Server-side enforcement** - All limits enforced on backend
2. **Database constraints** - Unique indexes prevent duplicate reports/ratings
3. **Input validation** - Zod schemas validate all inputs
4. **Content security** - Existing CSP headers

### 9.2 Abuse Detection

- Track repeated violations from same IP/user
- Auto-flag accounts with excessive violations
- Log all limit violations for audit

### 9.3 Data Privacy

- Only store necessary usage data
- No sensitive information in logs
- Storage usage aggregation, not file contents

---

## 10. Migration Plan

### Phase 1: Core Infrastructure (Week 1)
1. Create `limits.ts` configuration file
2. Create `UsageLimit` model
3. Create `LimitService` class
4. Create limit middleware

### Phase 2: Authentication & API Protection (Week 2)
1. Add user storage quota fields to User schema
2. Implement auth limits (registration, login, recovery)
3. Implement general API rate limits
4. Add storage quota checks to upload endpoints

### Phase 3: Feature-Specific Limits (Week 3)
1. AI tool limits (image enhancement, background removal, OCR)
2. Learning Hub limits (posts, comments, reviews)
3. Studio limits (projects, exports, assets)
4. Study Space limits (document-to-quiz, quizzes)

### Phase 4: Storage Protection (Week 4)
1. Implement storage aggregation service
2. Add storage quota enforcement
3. Create temporary file cleanup job
4. Update existing upload endpoints

### Phase 5: Admin Dashboard (Week 5)
1. Create Admin Limits page
2. Add usage statistics endpoints
3. Add user restriction endpoints
4. Add job management endpoints

### Phase 6: Monitoring & Testing (Week 6)
1. Add usage indicators to frontend
2. Implement response headers
3. Write comprehensive tests
4. Document all limits in API docs

---

## 11. Testing Strategy

### 11.1 Unit Tests

- LimitService methods
- Middleware functions
- Storage quota calculator
- Window calculations

### 11.2 Integration Tests

- Rate limiting behavior
- Storage quota enforcement
- Concurrent job limits
- User suspension logic

### 11.3 E2E Tests

- User hits rate limit, sees proper error
- User hits storage quota, upload rejected
- Admin can view/change limits
- Usage statistics are accurate

### 11.4 Load Testing

- Simulate burst traffic
- Verify graceful degradation
- Measure performance impact

---

## Configuration Values

All limits can be overridden via environment variables:

```bash
# Authentication
LIMIT_REGISTER_PER_HOUR=3
LIMIT_LOGIN_ATTEMPTS=5
LIMIT_RECOVERY_PER_HOUR=5

# API
LIMIT_API_PER_MINUTE=100
LIMIT_SEARCH_PER_MINUTE=60

# Storage
LIMIT_USER_STORAGE_BYTES=524288000  # 500 MB
LIMIT_TOTAL_STORAGE_BYTES=10161280000  # ~9.5 GB

# AI Tools
LIMIT_AI_ENHANCE_PER_HOUR=10
LIMIT_AI_BACKGROUND_REMOVER_PER_HOUR=10
LIMIT_AI_OCR_PER_HOUR=15

# Learning
LIMIT_POSTS_PER_DAY=10
LIMIT_COMMENTS_PER_HOUR=30
LIMIT_REVIEWS_PER_DAY=3

# Studio
LIMIT_STUDIO_PROJECTS=50
LIMIT_STUDIO_EXPORTS_PER_HOUR=20
```

---

## Backward Compatibility

- All existing functionality preserved
- New limits default to reasonable values
- Admin can disable individual limits if needed
- User data and purchase history preserved

---

## Future Enhancements

- Redis-based distributed rate limiting for multi-instance deployments
- Machine learning-based anomaly detection
- User-facing quota increase requests
- Automated abuse pattern detection

---

**End of Design Document**

---

## Implementation Status

### Phase 1: Core Infrastructure - ✅ COMPLETE
- [x] `server/src/config/limits.ts` - Centralized limit configuration
- [x] `server/src/models/UsageLimit.ts` - MongoDB usage tracking model
- [x] `server/src/models/User.ts` - Enhanced with storage quota fields
- [x] `server/src/models/index.ts` - Added UsageLimit export
- [x] `server/src/services/limitService.ts` - Rate limit and storage service
- [x] `server/src/middleware/limitMiddleware.ts` - Express middleware
- [x] `server/src/routes/limitRoutes.ts` - API endpoints for limits
- [x] `server/src/routes/index.ts` - Added limits routes
- [x] `server/src/app.ts` - Added rate limit headers middleware

### Phase 2: Authentication & API Protection - ✅ COMPLETE
- [x] Updated `authRoutes.ts` with centralized rate limiting
- [x] Updated `reviewRoutes.ts` with daily review limits
- [x] Updated `designAssetRoutes.ts` with storage quota checks
- [x] Updated `aiRoutes.ts` with tool-specific rate limits and concurrent job limits
- [x] Updated `learningRoutes.ts` with per-feature limits
- [x] Updated `designRoutes.ts` with project/operation limits
- [x] Updated `educationRoutes.ts` with study space limits

### Files Modified for Integration
1. `server/src/controllers/designAssetController.ts` - Added storage counter updates
2. Rate limit headers added to all responses via `app.ts`

### Next Steps
- [ ] Frontend components for usage indicators
- [ ] Admin dashboard UI for limit management
- [ ] Unit tests for all limit functionality
- [ ] Integration tests for rate limiting
- [ ] Email notifications for quota warnings