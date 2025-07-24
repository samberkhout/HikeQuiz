# Claude Code Configuration

## Project Context

This is an interactive hike app with GPS-based checkpoints. Users follow a hiking trail and receive questions at each checkpoint, only getting the route to the next point with correct answers.

## Technology Stack

### Frontend
- React Native with Expo (~53.0.20)
- Context API or Zustand for state management
- expo-location for GPS functionality
- react-navigation for navigation
- axios for API calls

### Backend
- Codex backend with PostgreSQL/SQLite
- JWT authentication
- REST API endpoints for users, checkpoints, questions, scores

## Project Structure

```
/hike-app/
├── App.js
├── /screens/
│   ├── HomeScreen.js
│   ├── CheckpointScreen.js
│   ├── QuestionScreen.js
│   └── FinishScreen.js
├── /components/
│   ├── MapViewComponent.js
│   └── QuestionCard.js
├── /api/
│   └── api.js
├── /agents/
│   ├── CheckpointAgent.js
│   ├── QuestionAgent.js
│   ├── RouteAgent.js
│   ├── ProgressAgent.js
│   └── UserAgent.js
├── /context/
│   └── UserContext.js
├── /utils/
│   └── location.js
└── /data/
    └── demoTrail.json
```

## Agent System

1. **CheckpointAgent**: Determines if user is at a checkpoint (30m radius)
2. **QuestionAgent**: Displays questions and handles answers
3. **RouteAgent**: Guides user to next checkpoint after correct answer
4. **ProgressAgent**: Tracks user progress through the hike
5. **UserAgent**: Manages user authentication and profile data

## Commands

### Development
- `cd hike-app && npm start` - Start Expo development server
- `cd hike-app && npm run android` - Run on Android
- `cd hike-app && npm run ios` - Run on iOS

### Testing
- `cd hike-app && npm test` - Run tests

## MVP Features

- 1 trail with 3 checkpoints
- Multiple choice questions
- GPS-based triggers
- Simple JSON backend or REST API
- Basic user authentication

## Key Implementation Notes

- App uses new React Native architecture
- GPS permissions required for checkpoint detection
- Questions only appear when within 30m of checkpoint
- Route to next checkpoint only revealed after correct answer
- Progress synchronized with backend