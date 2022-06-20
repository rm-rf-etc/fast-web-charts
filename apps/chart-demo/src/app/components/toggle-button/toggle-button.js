import template from "./toggle-button.ejs";

class ToggleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = template();
    this.checkbox = this.shadowRoot.querySelector("input");
    this.button = this.shadowRoot.querySelector("button");
    this.button.onclick = () => this.onClick();
  }

  connectedCallback() {
    this.checked = this.hasAttribute("checked");
    this.eventName = this.getAttribute("event-name");
    if (!this.eventName) throw "toggle-button element requires event-name attribute";
  }

  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    this.setAttribute("checked", !!value);
    this.checkbox.checked = !!value;

    window.dispatchEvent(new CustomEvent(this.eventName, {
      detail: { active: !!value },
    }));
  }

  onClick() {
    this.checked = !this.checkbox.checked;
  }
}
customElements.define("toggle-button", ToggleButton);
