// src/utils/socket.js
import { io } from 'socket.io-client';

// Create socket instance with connection to backend
const socket = io('http://localhost:3001', {
    autoConnect: false
});

// Socket utility functions
export const socketUtils = {
    connect: () => {
        if (!socket.connected) {
            socket.connect();
        }
        return socket;
    },

    disconnect: () => {
        if (socket.connected) {
            socket.disconnect();
        }
    },

    joinClass: (classId, userType) => {
        socket.emit('join-class', { classId, userType });
    },

    // Listen for events
    onUserCountUpdate: (callback) => {
        socket.on('user-count-updated', callback);
    },

    onRatingUpdate: (callback) => {
        socket.on('rating-updated', callback);
    },

    onLiveRatingUpdate: (callback) => {
        socket.on('live-rating-update', callback);
    },

    onNewComment: (callback) => {
        socket.on('new-comment', callback);
    },

    onStatsUpdate: (callback) => {
        socket.on('stats-updated', callback);
    },

    // Remove listeners
    offUserCountUpdate: () => {
        socket.off('user-count-updated');
    },

    offRatingUpdate: () => {
        socket.off('rating-updated');
    },

    offLiveRatingUpdate: () => {
        socket.off('live-rating-update');
    },

    offNewComment: () => {
        socket.off('new-comment');
    },

    offStatsUpdate: () => {
        socket.off('stats-updated');
    },

    // Get socket instance for custom events
    getSocket: () => socket
};

export default socket;