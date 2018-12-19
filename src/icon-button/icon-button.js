// Define our template and create in the constructor
function createIconButton (iconBtnOptions) {
  const { text } = iconBtnOptions
  const template = `
    <style>
      icon-button {
        display: inline-block;
      }
    </style>
    <button class="spx-btn spx-btn--pr spx-btn--material">${text}</button>
  `
  return template
}

class IconButton extends HTMLElement {
  constructor () {
    super()

    const tmpl = document.createElement('template')
    tmpl.innerHTML = this.createTemplate()
    const templateContent = tmpl.content
    this.appendChild(templateContent.cloneNode(true))
    this.innerButton = this.querySelector('button')
  }

  connectedCallback () {}

  disconnectedCallback () {}

  static get observedAttributes () {
    return ['disabled', 'icon', 'size'];
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    console.warn('arttrName', attrName)
    if (attrName === 'icon') {
      if (this.icon) {
        this.icon = newVal
      }
    }
    if (attrName === 'size') {
      if (this.size) {
        this.size = newVal
      }
    }
  }

  get text () {
    return this.getAttribute('text')
  }

  get icon () {
    return this.hasAttribute('icon')
  }

  set icon (val) {
    if (this.icon) {
      this.innerButton.setAttribute('data-icon', val)
    } else {
      this.innerButton.removeAttribute('data-icon')
    }
  }

  get size () {
    return this.hasAttribute('size')
  }

  set size (val) {
    // sizes should be "sm" or 'lg'
    if (this.size) {
      this.innerButton.classList.add(`spx-btn--${val}`)
    }
  }

  get disabled () {
    return this.hasAttribute('disabled');
  }

  set disabled (val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  createTemplate () {
    const iconBtnOptions = {
      text: this.text || 'No text added',
    }
    return createIconButton(iconBtnOptions)
  }
}

customElements.define('icon-button', IconButton);

customElements.whenDefined('icon-button').then(() => {
  console.log('icon-button defined');
});
