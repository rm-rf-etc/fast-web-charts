import template from "./nav-bar.ejs";

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = template();
  }
}
customElements.define("nav-bar", NavBar);
