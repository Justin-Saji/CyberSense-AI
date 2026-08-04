# CyberSense AI - Development Guide

## Project Overview
CyberSense AI is a modern enterprise cybersecurity SaaS platform built with React.js (Frontend), Flask (Backend), MySQL (Database), JWT Authentication, Google OAuth Login, and Flask-Mail.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Flask, SQLAlchemy, Flask-Bcrypt, Flask-Mail, Flask-CORS
- **Database**: MySQL
- **Authentication**: JWT, Google OAuth
- **State Management**: React Context API

## Build Commands
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
python app.py        # Start Flask server
```

## Validation Rules
- **Name**: 3-100 characters, letters and spaces only
- **Email**: Valid email format, converted to lowercase
- **Password**: 8-50 characters, must contain uppercase, lowercase, number, and special character
- **Login Password**: Minimum 6 characters

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Profile Management
- `GET /api/profile` - Get user profile and security data
- `PUT /api/profile` - Update user profile
- `POST /api/profile/avatar` - Upload avatar
- `DELETE /api/profile/avatar` - Remove avatar
- `POST /api/profile/password` - Change password
- `DELETE /api/profile/account` - Delete account
- `GET /api/profile/activity` - Get recent activity
- `GET /api/profile/security-score` - Get security score
- `GET /api/profile/download` - Download user data

## Database Schema

### Users Table (Main)
- `id` - Primary key
- `name` - User full name (3-100 chars)
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `google_id` - Google OAuth ID
- `avatar` - Avatar URL
- `created_at` - Account creation timestamp

### Security Scores Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `score` - Security score (0-100)
- `security_level` - Security level (Low/Medium/High)
- `risk_score` - Risk score (0-100)
- `password_strength` - Password strength label
- `last_updated` - Last update timestamp

### Activity Logs Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `activity` - Activity description
- `icon` - Icon name for display
- `color` - Color class for display
- `ip_address` - User IP address
- `user_agent` - Browser user agent
- `created_at` - Activity timestamp

### Achievements Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `badge_name` - Badge name
- `icon` - Icon name
- `unlocked` - Unlocked status
- `unlocked_at` - Unlock timestamp

### Notification Settings Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `security_alerts` - Security alerts toggle
- `phishing_alerts` - Phishing alerts toggle
- `password_expiry` - Password expiry alerts toggle
- `account_activity` - Account activity toggle
- `ai_notifications` - AI notifications toggle
- `email_notifications` - Email notifications toggle
- `marketing_emails` - Marketing emails toggle
- `account_visibility` - Account visibility toggle
- `anonymous_analytics` - Anonymous analytics toggle

### Privacy Settings Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `theme` - Theme preference (dark/light/system)
- `ai_recommendations` - AI recommendations toggle

### Risk Trends Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `week_number` - Week number
- `score` - Risk score for the week
- `created_at` - Record timestamp

## Future AI Integration Sections

The following sections are designed to be populated by ML models in the future:

### 1. SMS Phishing Detection
- **Location**: Dashboard/SmsPhishing page
- **Data Needed**: SMS content, sender information, timestamps
- **ML Model**: Text classification model for phishing detection
- **Output**: Risk score, phishing probability, explanation

### 2. Email Phishing Detection
- **Location**: Dashboard/EmailPhishing page
- **Data Needed**: Email content, headers, sender information
- **ML Model**: Email classification model with header analysis
- **Output**: Risk score, phishing indicators, safe/unsafe verdict

### 3. Malicious URL Detection
- **Location**: Dashboard/UrlScanner page
- **Data Needed**: URL, domain information, SSL certificate
- **ML Model**: URL classification model with domain reputation
- **Output**: Risk score, threat type, safety recommendation

### 4. Behavior Analysis
- **Location**: Profile/Security Dashboard
- **Data Needed**: User activity patterns, login times, device usage
- **ML Model**: Anomaly detection model
- **Output**: Behavior score, anomaly alerts, risk assessment

### 5. Cyber Risk Prediction
- **Location**: Profile/Security Dashboard
- **Data Needed**: Security score, activity patterns, external threat data
- **ML Model**: Risk prediction model
- **Output**: Predicted risk score, risk factors, mitigation suggestions

### 6. Explainable AI Results
- **Location**: All AI-powered features
- **Data Needed**: Model predictions, feature importance
- **ML Model**: XAI (Explainable AI) techniques
- **Output**: Feature contributions, decision reasoning, confidence scores

### 7. Personalized Security Coaching
- **Location**: Profile/AI Recommendations
- **Data Needed**: User behavior, security score, vulnerability assessment
- **ML Model**: Recommendation engine
- **Output**: Personalized tips, priority actions, learning resources

### 8. Risk Timeline
- **Location**: Profile/Risk Trend Graph
- **Data Needed**: Historical risk scores, security events
- **ML Model**: Time series forecasting
- **Output**: Risk predictions, trend analysis, improvement projections

### 9. Behavior Drift Detection
- **Location**: Profile/Security Dashboard
- **Data Needed**: Historical behavior patterns, current behavior
- **ML Model**: Drift detection algorithms
- **Output**: Drift score, unusual patterns, security alerts

### 10. Security Awareness Progress
- **Location**: Profile/Achievements
- **Data Needed**: Training completion, quiz scores, engagement metrics
- **ML Model**: Progress tracking model
- **Output**: Awareness score, learning path, achievement unlocks

## Component Structure

### Reusable Components
- `FormField.jsx` - Standardized form input with validation
- `CheckboxField.jsx` - Checkbox input with validation
- `PasswordStrengthMeter.jsx` - Password strength indicator
- `LoadingSpinner.jsx` - Loading animation
- `Toast.jsx` - Notification system
- `Modal.jsx` - Modal dialog
- `SkeletonLoader.jsx` - Content placeholder

### Page Components
- `Login.jsx` - Login page with validation
- `Register.jsx` - Registration page with validation
- `ResetPassword.jsx` - Password reset with validation
- `Profile.jsx` - Comprehensive profile management
- `Dashboard.jsx` - Main dashboard
- `Settings.jsx` - Application settings

## Security Best Practices
1. All API requests use JWT authentication
2. Passwords are hashed using Bcrypt
3. Input validation on both client and server
4. XSS protection through input sanitization
5. CORS enabled for specific origins
6. Environment variables for sensitive data
7. SQL injection prevention through SQLAlchemy ORM

## Code Quality Standards
1. Use functional components with hooks
2. Implement proper error handling
3. Add loading states for async operations
4. Use TypeScript-like prop validation (via PropTypes in future)
5. Follow consistent naming conventions
6. Write reusable utility functions
7. Implement proper accessibility (ARIA labels, keyboard navigation)
8. Add responsive design for mobile devices

## Theme & Styling
- **Primary Color**: Cyan (#06b6d4)
- **Background**: Dark slate (#0f172a)
- **Text**: White with slate variations
- **Success**: Emerald
- **Warning**: Amber
- **Error**: Rose
- **Info**: Blue

## Performance Optimization
1. Code splitting with React.lazy
2. Image optimization for avatars
3. Debounced search inputs
4. Memoized components where appropriate
5. Lazy loading for heavy components
6. API response caching
7. Database query optimization

## Testing Strategy
1. Unit tests for utility functions
2. Component tests for React components
3. Integration tests for API endpoints
4. E2E tests for critical user flows
5. Security testing for authentication
6. Performance testing for load handling

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] CORS settings updated for production
- [ ] Rate limiting implemented
- [ ] Logging and monitoring set up
- [ ] Backup strategies configured
- [ ] Security headers configured
