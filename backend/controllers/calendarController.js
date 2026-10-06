// calendarController.js - handles routes for calendar integration (OAuth and events)
import * as googleCalendar from '../algorithms/googleCalendar.js';
import * as tokenStore from '../algorithms/tokenStore.js';
import * as userService from '../userService.js'; // To update user profile with calendar info
import * as gcalAlgorithm from '../algorithms/gcalAlgorithm.js'; // To calculate free slots from events

// Return an auth URL to start OAuth flow
export function getAuthUrl(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    // Pass userId as state so it comes back in the callback
    const url = googleCalendar.generateAuthUrl(userId);
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Callback to exchange code and save tokens for a user
export async function oauthCallback(req, res) {
  try {
    const code = req.query.code;
    const userId = req.query.state; // Get userId from OAuth state parameter

    if (!code) {
      return res.status(400).json({ success: false, error: 'Missing authorization code' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId - please connect from Profile page' });
    }

    const tokens = await googleCalendar.getTokensFromCode(code);

    // 2. Fetch the busy events immediately
    const now = new Date().toISOString();
    const rawEvents = await googleCalendar.listEvents(tokens, { timeMin: now, maxResults: 100 });

    // 3. TRANSFORM: Turn raw Google events into "Free Slots"
    // Import gcalAlgorithm at the top of this file to use this
    const freeSlots = gcalAlgorithm.calculateFreeSlots(rawEvents);

    await tokenStore.saveTokens(userId, tokens);
    await userService.saveUserProfile(userId, {
      availability: freeSlots,
      calendarConnected: true
    });

    // Redirect back to frontend with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/profile?calendar=connected`);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get upcoming events for a saved user LISTEVENTS OR CALENDAR.FREEBUSY
export async function getEvents(req, res) {
  try {
    const { userId } = req.params;
    const tokens = await tokenStore.getTokens(userId);
    if (!tokens) return res.status(404).json({ success: false, error: 'No tokens for this user' });

    const now = new Date().toISOString();
    // LISTEVENTS returns detailed event info, FREEBUSY returns only busy time slots. Adjust as needed.
    const events = await googleCalendar.listEvents(tokens, { timeMin: now, maxResults: 50 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
