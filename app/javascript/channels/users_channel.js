import consumer from './consumer'
import CableReady from 'cable_ready'

let channel

document.addEventListener('turbo:load', () => {
  if (channel) return

  channel = consumer.subscriptions.create('UsersChannel', {
    received (data) {
      if (!data) channel = undefined
      if (data.cableReady) CableReady.perform(data.operations)
    }
  })
})
