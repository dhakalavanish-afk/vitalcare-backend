# VitalCare Backend API

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT tokens
- **Payments:** Stripe (ready to integrate)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Go to https://supabase.com and create a free account
2. Create a new project called "vitalcare"
3. Go to SQL Editor and paste the contents of `database-schema.sql` and run it
4. Go to Settings > API and copy your Project URL and keys

### 3. Configure Environment
```bash
cp .env.example .env
```
Fill in your `.env` file:
- `SUPABASE_URL` - from Supabase Settings > API
- `SUPABASE_ANON_KEY` - from Supabase Settings > API
- `SUPABASE_SERVICE_KEY` - from Supabase Settings > API
- `JWT_SECRET` - any random string (minimum 32 characters)
- `EMAIL_USER` - care@rivaanhealth.com
- `EMAIL_PASS` - Gmail app password

### 4. Run the Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/members | Create member profile |
| GET | /api/members | Get all members (Admin) |
| GET | /api/members/:id | Get member by ID |
| PUT | /api/members/:id | Update member |
| POST | /api/members/:id/family-access | Add family access |

### Nurses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/nurses | Create nurse profile |
| GET | /api/nurses | Get all nurses |
| GET | /api/nurses/:id | Get nurse by ID |
| PUT | /api/nurses/:id/availability | Update availability |
| POST | /api/nurses/assign | Assign nurse to member |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/subscriptions/plans | Get all plans (public) |
| POST | /api/subscriptions | Create subscription |
| GET | /api/subscriptions/member/:id | Get member subscription |
| PUT | /api/subscriptions/:id/cancel | Cancel subscription |

### Visits
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/visits | Book a visit |
| GET | /api/visits/member/:id | Get member visits |
| GET | /api/visits/nurse/:id | Get nurse visits |
| PUT | /api/visits/:id/complete | Complete visit + record vitals |
| PUT | /api/visits/:id/cancel | Cancel visit |

## Deploy to Railway (Free)
1. Go to https://railway.app
2. Connect your GitHub repo
3. Add environment variables
4. Deploy!
