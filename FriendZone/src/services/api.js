// // API service for making requests to the backend
// // Firebase authentication functions for Google Sign-In

// //**HOW TO USE THIS FILE IN FRONT END-->>

// // if you wanna use this in front end import { api } from '../services/api.js'; and then 
// // call api.loginWithGoogle() to trigger the Google Sign-In flow. This will return an object with 
// // user info and tokens that you can use to authenticate with your backend and access Google Calendar data.
// import { auth } from '../../../backend/firebase.js'; // Firebase auth instance (configured in firebase.js)

// import {
//     signInWithPopup,  // Opens a popup for user to sign in with Google
//     GoogleAuthProvider,  // Google OAuth provider
//     onAuthStateChanged,  // Listens to auth state changes
//     signOut  // Signs out the current user
// } from 'firebase/auth';

// const API_BASE_URL = 'http://localhost:5000/api';

// export const api = {
//     //@5:26pm added sign in and sign out
//     /**
//      * Firebase Google Sign-In
//      * Opens a popup for user to sign in with Google account
//      * Automatically requests Google Calendar read-only access
//      * @returns {Object} { success, userId, email, name, idToken, credential }
//      */
//     // Firebase Google Sign-In with Calendar access
//     loginWithGoogle: async () => {
//         try {
//             const provider = new GoogleAuthProvider();

//             // Request Google Calendar scope for read-only access to events
//             provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
//             // Request email and profile information
//             provider.addScope('https://www.googleapis.com/auth/userinfo.email');
//             provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

//             // Open Google Sign-In popup
//             const result = await signInWithPopup(auth, provider);
//             const user = result.user;
//             const credential = GoogleAuthProvider.credentialFromResult(result);
//             // Get Firebase ID token for backend verification
//             const idToken = await user.getIdToken();

//             return {
//                 success: true,
//                 userId: user.uid,  // Firebase user ID
//                 email: user.email,  // Google email
//                 name: user.displayName,  // Google display name
//                 idToken,  // Firebase ID token for backend
//                 credential, // Contains Google access token for Calendar API
//             };
//         } catch (error) {
//             return {
//                 success: false,
//                 error: error.message,
//             };
//         }
//     },

//     /**
//      * Firebase Sign Out
//      * Logs out the currently authenticated user
//      * @returns {Object} { success, error? }
//      */
//     // Logout: @5:26pm
//     logout: async () => {
//         try {
//             await signOut(auth);
//             return { success: true };
//         } catch (error) {
//             return { success: false, error: error.message };
//         }
//     },

//     /**
//      * Get Current Authenticated User
//      * Returns the currently logged-in user object
//      * Uses Firebase onAuthStateChanged listener
//      * @returns {Promise<User|null>} Firebase user object or null if not logged in
//      */
//     // Get current authenticated user @5:26pm
//     getCurrentUser: () => {
//         return new Promise((resolve) => {
//             onAuthStateChanged(auth, (user) => {
//                 resolve(user);
//             });
//         });
//     },

//     // Get all matches for a user
//     getMatches: async (userId) => {
//         const response = await fetch(`${API_BASE_URL}/matches/${userId}`);
//         return response.json();
//     },

//     // Get user profile
//     getProfile: async (userId) => {
//         const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
//         return response.json();
//     },

//     // Update user profile
//     updateProfile: async (userId, profileData) => {
//         const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(profileData),
//         });
//         return response.json();
//     },

//     /**
//      * Compare schedules of two users using Google Calendar
//      * Fetches calendar events and calculates time compatibility match score
//      * @param {String} userId1 - First user ID
//      * @param {String} userId2 - Second user ID
//      * @returns {Promise<Object>} { matchScore, overlappingTimes, totalOverlapHours }
//      */
//     // Compare schedules using Google Calendar
//     compareSchedules: async (userId1, userId2) => {
//         const response = await fetch(`${API_BASE_URL}/compare-schedules`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ userId1, userId2 }),
//         });
//         return response.json();
//     },
// };

// export default api;

//******************//******************//******************//******************//******************
// src/services/api.js
import { auth } from "../firebase.js"; // frontend Firebase config
import {
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "firebase/auth";

const API_BASE_URL = 'https://h4h2026-production-2c92.up.railway.app/api';

export const api = {
    loginWithGoogle: async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
            provider.addScope('https://www.googleapis.com/auth/userinfo.email');
            provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const idToken = await user.getIdToken();

            // --- NEW: SEND DATA TO BACKEND ---
            // This registers the user and saves their calendar tokens
            await fetch(`${API_BASE_URL}/users`, { // Or your /users/login route
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    email: user.email,
                    name: user.displayName,
                    tokens: credential // This includes the access_token for the calendar
                }),
            });
            // ---------------------------------

            return {
                success: true,
                userId: user.uid,
                email: user.email,
                name: user.displayName,
                idToken,
                credential,
            };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getCurrentUser: () => {
        return new Promise((resolve) => {
            onAuthStateChanged(auth, (user) => resolve(user));
        });
    },

    getMatches: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/matches/${userId}`);
        return response.json();
    },

    getProfile: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        return response.json();
    },

    updateProfile: async (userId, profileData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...profileData }),
        });
        return response.json();
    },

    compareSchedules: async (userId1, userId2) => {
        const response = await fetch(`${API_BASE_URL}/compare-schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId1, userId2 }),
        });
        return response.json();
    },
    /*
    connectGoogleCalendar: async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
            provider.addScope('https://www.googleapis.com/auth/userinfo.email');
            provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const accessToken = credential?.accessToken || credential?.oauthAccessToken || result?._tokenResponse?.oauthAccessToken;
            const idToken = await user.getIdToken();

            await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    email: user.email,
                    name: user.displayName,
                    tokens: credential,
                    idToken,
                    accessToken,
                }),
            });

            return {
                success: true,
                userId: user.uid,
                email: user.email,
                name: user.displayName,
                accessToken,
                idToken,
                credential,
            };
        } catch (error) {
            console.error('Calendar connect error:', error);
            return { success: false, error: error.message };
        }
    },
    */
    // Get Google Calendar OAuth URL
    getCalendarAuthUrl: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/calendar/auth?userId=${userId}`);
        return response.json();
    },
};

export default api;