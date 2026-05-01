import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class WatchPartySocket {
  constructor() {
    this.socket = null
  }

  /**
   * Connect and join a Watch Party room
   * @param {string} sessionCode
   * @param {string|null} token - JWT for auth
   */
  connect(sessionCode, token = null) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    this.socket.emit('party:join', { sessionCode })
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // ── Emitters ──
  submitMoodProfile(moodProfile) {
    this.socket?.emit('party:submit-mood', { moodProfile })
  }

  startParty() {
    this.socket?.emit('party:start')
  }

  // ── Listeners (returns unsubscribe fn) ──
  onParticipantJoined(cb)   { return this._on('party:participant-joined', cb) }
  onParticipantLeft(cb)     { return this._on('party:participant-left', cb) }
  onParticipantReady(cb)    { return this._on('party:participant-ready', cb) }
  onPartyStarted(cb)        { return this._on('party:started', cb) }
  onResultsReady(cb)        { return this._on('party:results', cb) }
  onError(cb)               { return this._on('party:error', cb) }

  _on(event, cb) {
    this.socket?.on(event, cb)
    return () => this.socket?.off(event, cb)
  }
}

// Singleton instance
export const watchPartySocket = new WatchPartySocket()
