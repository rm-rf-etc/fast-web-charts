import template from './top-bar.ejs';

class TopBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = template();
  }
}
customElements.define('top-bar', TopBar);
