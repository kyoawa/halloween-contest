# Halloween Costume Contest - Tinder-Style Voting App

A fun, interactive voting system for Halloween costume contests with a Tinder-style swipe interface. Users can swipe right to vote for their favorite costumes and swipe left to skip. Features real-time leaderboard, admin panel for managing contestants, and mobile-responsive design.

## Features

- **Tinder-Style Voting**: Swipe right to vote, left to skip
- **Admin Panel**: Upload contestants with photos and names
- **Real-time Results**: Live leaderboard showing top 3 winners
- **Mobile Responsive**: Works great on phones, tablets, and desktops
- **Session Tracking**: Each user can only vote once per contestant
- **Statistics Dashboard**: View total contestants, votes, and unique voters

## Tech Stack

### Backend
- Node.js with Express
- SQLite database (better-sqlite3)
- Multer for file uploads
- RESTful API

### Frontend
- React with Vite
- React Router for navigation
- react-tinder-card for swipe functionality
- Modern CSS with gradients and animations

## Project Structure

```
halloween-contest/
├── backend/
│   ├── src/
│   │   ├── index.js       # Express server & API routes
│   │   └── database.js    # SQLite database setup
│   ├── data/              # SQLite database file
│   ├── uploads/           # Uploaded contestant images
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── VotingPage.jsx    # Tinder-style voting interface
│   │   │   ├── AdminPage.jsx     # Upload & manage contestants
│   │   │   └── ResultsPage.jsx   # Top 3 winners leaderboard
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── package.json
```

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
cd halloween-contest
```

2. Install dependencies:
```bash
npm run install:all
```

### Running Locally

1. Start the backend server (runs on port 3001):
```bash
npm run dev:backend
```

2. In a new terminal, start the frontend dev server (runs on port 5173):
```bash
npm run dev:frontend
```

3. Open your browser to `http://localhost:5173`

## Deployment to Railway

### Step 1: Prepare Your Repository

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: Halloween costume contest app"
```

2. Create a GitHub repository and push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/halloween-contest.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [Railway.app](https://railway.app) and sign up/login

2. Click "New Project" → "Deploy from GitHub repo"

3. Select your `halloween-contest` repository

4. Railway will automatically:
   - Detect the project configuration from `railway.json`
   - Install all dependencies
   - Build the frontend
   - Start the backend server

5. Railway will assign you a URL (e.g., `your-app.railway.app`)

### Step 3: Configure Environment

Railway automatically sets the `PORT` environment variable. No additional configuration needed!

### Step 4: Access Your App

Once deployed, you can access:
- **Voting Page**: `https://your-app.railway.app/`
- **Results Page**: `https://your-app.railway.app/results`
- **Admin Panel**: `https://your-app.railway.app/admin`

## Usage Guide

### For Administrators

1. Navigate to the **Admin** page
2. Click "Choose File" to select a costume photo
3. Enter the contestant's name
4. Click "Add Contestant"
5. View statistics and manage contestants

### For Voters

1. Navigate to the **Vote** page (homepage)
2. You'll see contestant photos one at a time
3. **Swipe right** (or click "Vote") to vote for that costume
4. **Swipe left** (or click "Skip") to pass
5. Continue until you've seen all contestants
6. Check the **Results** page to see the winners!

### Viewing Results

1. Navigate to the **Results** page
2. See the top 3 winners with their vote counts
3. Results auto-refresh every 10 seconds
4. Share the results page URL with everyone!

## API Endpoints

### Contestants
- `GET /api/contestants` - Get all contestants
- `GET /api/contestants/vote?session={id}` - Get contestants user hasn't voted for
- `POST /api/contestants` - Add new contestant (multipart/form-data)
- `DELETE /api/contestants/:id` - Delete contestant

### Voting
- `POST /api/vote` - Submit a vote
  ```json
  {
    "contestant_id": 1,
    "session": "voter_12345"
  }
  ```

### Results
- `GET /api/results` - Get top 3 winners
- `GET /api/stats` - Get voting statistics

## Database Schema

### contestants
- `id` - Primary key
- `name` - Contestant name
- `image_path` - Path to uploaded image
- `votes` - Vote count
- `created_at` - Timestamp

### votes
- `id` - Primary key
- `contestant_id` - Foreign key to contestants
- `voter_session` - Unique session ID
- `voted_at` - Timestamp

## Customization

### Changing Colors/Theme

Edit the gradient colors in:
- [frontend/src/index.css](/halloween-contest/frontend/src/index.css) - Main background gradient
- [frontend/src/pages/VotingPage.css](/halloween-contest/frontend/src/pages/VotingPage.css) - Button gradients
- [frontend/src/pages/AdminPage.css](/halloween-contest/frontend/src/pages/AdminPage.css) - Admin theme

### File Upload Limits

Modify file size limit in [backend/src/index.js:34](/halloween-contest/backend/src/index.js#L34):
```javascript
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
```

### Number of Winners

Change the top 3 limit in [backend/src/index.js:137](/halloween-contest/backend/src/index.js#L137):
```javascript
LIMIT 3  // Change to any number
```

## Troubleshooting

### Images not loading
- Check that the `backend/uploads/` directory exists
- Verify Railway has persistent storage configured

### Database resets on Railway restart
- Railway provides ephemeral storage by default
- For persistence, add a Railway Volume:
  1. Go to your Railway project
  2. Click "Variables" → "Volumes"
  3. Add volume mounted to `/app/backend/data`

### Build fails on Railway
- Ensure all dependencies are listed in package.json
- Check Railway build logs for specific errors
- Verify Node.js version compatibility

## Security Notes

- **Admin Panel**: Currently unprotected. Consider adding authentication for production use
- **File Uploads**: Only image files are allowed (validated by mimetype)
- **Session IDs**: Generated client-side. For higher security, use server-side sessions
- **CORS**: Enabled for all origins in development. Consider restricting in production

## License

ISC

## Support

For issues or questions, create an issue on GitHub.

---

Built with love for Halloween costume contests! 🎃👻🦇
