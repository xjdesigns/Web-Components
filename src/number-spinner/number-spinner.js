// Define our template and create in the constructor
const darkGray = '#606060'
const darkGrayHover = '#000'
function createNumberSpinner () {
  const template = `
    <style>
      number-spinner {
        display: block;
      }
      .spinner-value,
      .spinner-btn {
        display: inline-block;
        vertical-align: middle;
      }
      .spinner-value {
        min-width: 100px;
        padding: 12px;
        margin: 0 -5px 0 -4px;
        text-align: center;
        border: 1px solid ${darkGray};
        border-radius: 6px;
      }
      .spinner-btn {
        min-width: 50px;
        padding: 9px;
        background: ${darkGray};
        color: white;
        font-size: 100%;
        transition: background .3s ease-in-out;
      }
      .spinner-btn:hover {
        background: ${darkGrayHover};
      }
      .spinner-btn:first-of-type {
        border-radius: 6px 0 0 6px;
      }
      .spinner-btn:last-of-type {
        border-radius: 0 6px 6px 0;
      }
    </style>
    <button id="minusBtn" class="spinner-btn" aria-label="minus">-</button>
    <p id="innerValue" class="spinner-value"></p>
    <button id="plusBtn" class="spinner-btn" aria-label="plus">+</button>
  `
  return template
}

class NumberSpinner extends HTMLElement {
  constructor () {
    super()

    const tmpl = document.createElement('template')
    tmpl.innerHTML = this.createTemplate()
    const templateContent = tmpl.content
    this.appendChild(templateContent.cloneNode(true))

    this.innerValue = this.querySelector('#innerValue')
    this.minusBtn = this.querySelector('#minusBtn')
    this.plusBtn = this.querySelector('#plusBtn')

    this._innerValue = 0
    this.incrementValue = this.incrementValue.bind(this)
    this.decrementValue = this.decrementValue.bind(this)
    this.dispatchChangeEvent = this.dispatchChangeEvent.bind(this)
  }

  connectedCallback () {
    this.plusBtn.onclick = this.incrementValue
    this.minusBtn.onclick = this.decrementValue
  }

  disconnectedCallback () {}

  static get observedAttributes () {
    return ['disabled', 'value'];
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    if (attrName === 'value') {
      this.value = newVal
    }
  }

  get value () {
    return this._innerValue
  }

  set value (val) {
    const value = Number(val)
    this.innerValue.innerHTML = value
    this._innerValue = value
  }

  createTemplate () {
    return createNumberSpinner()
  }

  decrementValue () {
    this.value = --this._innerValue
    this.dispatchChangeEvent()
  }

  incrementValue () {
    this.value = ++this._innerValue
    this.dispatchChangeEvent()
  }

  dispatchChangeEvent () {
    const event = new CustomEvent("spinnerChanged", {
      detail: {
        innerValue: this._innerValue,
      },
      bubbles: true,
      cancelable: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('number-spinner', NumberSpinner);

customElements.whenDefined('number-spinner').then(() => {
  console.log('number-spinner defined');
});
