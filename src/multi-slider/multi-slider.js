// Define our template and create in the constructor
function createMultiSlider () {
  // thumbs are dynamically created based off values passed
  const template = `
  <div class="spx-mrange" data-id="mrange">
    <div class="spx-mrange__track" data-id="mtrack" />
  </div>
  `
  return template
}

class MultiSlider extends HTMLElement {
  constructor () {
    super()

    const tmpl = document.createElement('template')
    tmpl.innerHTML = this.createTemplate()
    const templateContent = tmpl.content
    this.appendChild(templateContent.cloneNode(true))

    this.valueArray = null
    this.thumbs = null
    this.thumbKey = 'thumb'
    this.dragging = false
    this.currentId = null
    this.currentThumbOffset = 0
    this.currentIndex = 0

    this.trackLeft = 0
    this.trackWidth = 0
    // I need to dynamically handle this
    this.trackMax = 0

    this.initializeValues = this.initializeValues.bind(this)
    this.startDrag = this.startDrag.bind(this)
    this.stopDrag = this.stopDrag.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.updateValuesOnChange = this.updateValuesOnChange.bind(this)
    this.dispatchChangeEvent = this.dispatchChangeEvent.bind(this)
  }

  connectedCallback () {
    this.createThumbs()
    // setup listeners
    document.addEventListener('mousemove', this.handleMove)
    document.addEventListener('mouseup', this.stopDrag)

    // TODO: This needs to be handled better
    this.track = document.querySelector('.spx-mrange__track')
    this.trackLeft = this.track.offsetLeft
    this.trackWidth = this.track.offsetWidth
    // I need to dynamically handle this
    this.trackMax = this.trackWidth - 20
  }

  disconnectedCallback () {
    // destory listeners
    document.removeEventListener('mousemove', this.handleMove)
    document.removeEventListener('mouseup', this.stopDrag)
    // NOTE: I need to clean up the slider handlers as well
  }

  static get observedAttributes () {
    return ['values'];
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    if (attrName === 'values') {
      this.values = newVal
    }
  }

  get values () {
    return this.valueArray
  }

  set values (val) {
    this.valueArray = this.initializeValues(val)
  }

  createTemplate () {
    return createMultiSlider()
  }

  initializeValues (val) {
    const values = val.split(',').map(Number)
    this.initializeThumbValues(values)
    return values
  }

  initializeThumbValues (values) {
    let thumbs = {}
    const len = values.length

    for (let idx = 0; idx < len; idx++) {
      let min
      let max
      let value

      if (idx === 0) {
        value = values[idx]
        min = 0
        max = values[idx + 1] - 1
      } else if (idx === values.length - 1) {
        value = values[idx]
        min = values[idx - 1] + 1
        max = 100
      } else {
        value = values[idx]
        min = values[idx - 1] + 1
        max = values[idx + 1] - 1
      }

      thumbs[`${this.thumbKey}${idx}`] = {
        id: `${this.thumbKey}${idx}`,
        index: idx,
        value: value,
        min: min,
        max: max,
      }
    }

    console.warn('thumbs:::', thumbs)
    this.thumbs = thumbs
  }

  createThumbs () {
    const map = this.thumbs
    const range = document.querySelector('[data-id="mrange"]')
    let thumbFragment = document.createDocumentFragment()

    for (let key in map) {
      const val = map[key]
      let thumb = document.createElement('div')
      thumb.classList.add('spx-mrange__thb')
      thumb.setAttribute('id', val.id)
      thumb.setAttribute('style', `left: calc(${val.value}% - 10px)`)
      thumb.addEventListener('mousedown', this.startDrag)
      thumbFragment.appendChild(thumb)

      // store the element on the map to re use without needing to sniff the DOM
      map[key].element = thumb
    }

    range.appendChild(thumbFragment)
  }

  startDrag (ev) {
    ev.preventDefault()
    const thumbMap = this.thumbs
    this.isDragging = true
    this.currentId = ev.target.id
    this.currentIndex = thumbMap[this.currentId].index
    const currentEl = document.querySelector(`#${this.currentId}`)
    this.currentThumbOffset = ev.clientX - currentEl.offsetLeft
  }

  stopDrag () {
    if (this.isDragging) {
      this.updateValuesOnChange(this.thumbs)
      this.isDragging = false
      this.dispatchChangeEvent()
    }
  }

  handleMove (ev) {
    if (this.isDragging) {
      const thumbMap = this.thumbs
      const currentEl = thumbMap[this.currentId]
      let offsetMulti = ev.clientX - this.trackLeft - this.currentThumbOffset
      offsetMulti = percentAsVal(offsetMulti, this.trackMax, 10)

      // NOTE: this is min/max
      if(offsetMulti < currentEl.min) {
        offsetMulti = currentEl.min
      } else if(offsetMulti > currentEl.max) {
        offsetMulti = currentEl.max
      }

      thumbMap[this.currentId].value = offsetMulti
      thumbMap[this.currentId].element.setAttribute('style', `left: calc(${offsetMulti}% - 10px)`)
      const value = offsetMulti
    }
  }

  updateValuesOnChange (map) {
    const values = this.values
    const idx = this.currentIndex
    if (values.length > 1) {
      if (idx === 0) {
        map[`thumb${idx + 1}`].min = map[`thumb${idx}`].value + 1
      } else if (idx === (values.length - 1)) {
        map[`thumb${idx - 1}`].max = map[`thumb${idx}`].value - 1
      } else {
        map[`thumb${idx - 1}`].max = map[`thumb${idx}`].value - 1
        map[`thumb${idx + 1}`].min = map[`thumb${idx}`].value + 1
      }
    }
  }

  // TODO: I never update the values again....
  // this just dispatches the original values
  dispatchChangeEvent () {
    const event = new CustomEvent("multiRangeChanged", {
      detail: {
        values: this.values,
      },
      bubbles: true,
      cancelable: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('multi-slider', MultiSlider);

customElements.whenDefined('multi-slider').then(() => {
  console.log('multi-slider defined');
});

function percentAsVal (val, max, percent) {
  const valToStep = getPercentOfMax(max, percent)
  const value =  val / valToStep
  return Math.floor(value * 10)
}

function getPercentOfMax (max, percent) {
  return max * (percent / 100)
}
