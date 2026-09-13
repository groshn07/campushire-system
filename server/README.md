# CampusHire Server

This backend provides authentication, job management, application tracking, analytics, notifications, interview room chat, and file uploads for the CampusHire placement platform.

## Run

1. Open a terminal in this folder.
2. Install dependencies:
   npm install
3. Start the server:
   npm start

The API will be available on http://localhost:4000

## Default demo accounts

- Student: student@demo.com / demo123
- Recruiter: recruiter@demo.com / demo123
- Admin: admin@demo.com / demo123

## Main endpoints

- POST /api/auth/login
- POST /api/auth/register
- GET /api/me
- GET /api/jobs
- POST /api/jobs
- POST /api/jobs/:jobId/apply
- GET /api/applications
- PATCH /api/applications/:id/status
- GET /api/interviews
- GET /api/rooms/:roomId/messages
- POST /api/rooms/:roomId/messages
- POST /api/uploads
- GET /api/analytics
- GET /api/notifications
