import CableReady from 'cable_ready'
import consumer from './consumer'

let reconnecting = false

consumer.subscriptions.create('SessionsChannel', {
  received (data) {
    if (data.cableReady)
      CableReady.perform(data.operations, {
        emitMissingElementWarnings: false
      })
  },

  connected () {
    reconnecting = false
    document.addEventListener('reconnect', this.reconnect)
  },

  disconnected () {
    document.removeEventListener('reconnect', this.reconnect)
    if (reconnecting) setTimeout(() => consumer.connect(), 25)
  },

  reconnect () {
    reconnecting = true
    consumer.disconnect()
  }
})
