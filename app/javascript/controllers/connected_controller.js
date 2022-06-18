import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  initialize () {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          if (mutation.target.classList.contains('stimulus-reflex-connected')) {
            this.element.removeAttribute('aria-busy')
            this.element.disabled = false
          } else {
            this.element.setAttribute('aria-busy', 'true')
            this.element.disabled = true
          }
        }
      })
    })
  }

  connect () {
    this.observer.observe(document.body, { attributes: true })
  }

  disconnect () {
    this.observer.disconnect()
  }
}
