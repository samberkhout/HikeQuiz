# API Setup Guide

## OpenRouteService API Key Setup

To enable real walking routes in the hike app, you need to get a free API key from OpenRouteService:

### Steps:
1. Visit [OpenRouteService Developer Portal](https://openrouteservice.org/dev/#/signup)
2. Sign up for a free account (2000 requests/day limit)
3. Get your API key from the dashboard
4. Add your API key to `services/RouteService.js`:

```javascript
// In RouteService.js constructor:
this.orsApiKey = 'YOUR_API_KEY_HERE';
```

### Alternative: Environment Variable
You can also set it as an environment variable:

```javascript
// In RouteService.js constructor:
this.orsApiKey = process.env.OPENROUTE_API_KEY || null;
```

### Without API Key
The app will work without an API key using enhanced pathfinding algorithms that create realistic walking routes, but won't use actual street/path data.

## Features Available:
- ✅ **With API Key**: Real walking routes using actual paths and sidewalks
- ✅ **Without API Key**: Enhanced algorithmic routes with terrain awareness
- ✅ **Always Available**: Smart curved paths as final fallback

The app gracefully degrades from real routes → smart routes → simple routes based on availability.