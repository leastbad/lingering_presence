import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['errors']

  loginFailed = async event => {
    event.preventDefault()
    this.errorsTarget.textContent = await event.detail.fetchResponse.text()
    this.errorsTarget.classList.remove('d-none')
  }
}
