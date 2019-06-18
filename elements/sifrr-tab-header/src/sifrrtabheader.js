import SifrrDom from '@sifrr/dom';
import style from './style.scss';

const template = SifrrDom.template`<style media="screen">
  ${style}
  slot::slotted(*) {
    \${this.options ? this.options.style : ''}
  }
</style>
<slot>
</slot>
<div class="underline"></div>`;

function removeExceptOne(elements, name, index) {
  for (let j = 0, l = elements.length; j < l; j++) {
    j === index || elements[j] === index ? elements[j].classList.add(name) : elements[j].classList.remove(name);
  }
}

class SifrrTabHeader extends SifrrDom.Element {
  static get template() {
    return template;
  }

  static observedAttrs() {
    return ['options'];
  }

  onConnect() {
    this._connected = true;
    this.$('slot').addEventListener('slotchange', this.refresh.bind(this, {}));
    this.refresh();
  }

  onAttributeChange(n, _, v) {
    if (n === 'options') {
      this._attrOptions = JSON.parse(v || '{}');
      if (this._connected) this.refresh();
    }
  }

  refresh(options = {}) {
    this.options = Object.assign({
      content: this,
      slot: this.$('slot'),
      showUnderline: true,
      line: this.$('.underline'),
      container: null
    }, this.options, options, this._attrOptions);
    this.options.menus = this.options.slot.assignedNodes().filter(n => n.nodeType === 1);
    if (!this.options.menus || this.options.menus.length < 1) return;
    this.setProps();
    this.active = this.active || 0;
  }

  setProps() {
    if (!this.options.showUnderline) this.options.line.style.display = 'none';
    this.setMenuProps();
    if (this.options.container) {
      const c = this.options.container;
      c.onScrollPercent = this.setScrollPercent.bind(this);
      SifrrDom.Event.addListener('update', c, () => this.active = c.active);
    }
  }

  setMenuProps() {
    let left = 0;
    this.options.menuProps = [];
    Array.from(this.options.menus).forEach((elem, i) => {
      this.options.menuProps[i] = {
        width: elem.offsetWidth,
        left: left
      };
      left += elem.offsetWidth;
      elem._click = () => {
        if (this.options.container) this.options.container.active = i;
        else this.active = i;
      };
    });
    const last = this.options.menuProps[this.options.menus.length - 1];
    this.options.totalMenuWidth = last.left + last.width;
    this.options.slot.style.width = last.left + last.width + 1 * this.options.menuProps.length + 'px';
    const active = this.options.menuProps[this.active];
    this.options.line.style.left = active.left + 'px';
    this.options.line.style.width = active.width + 'px';
    this.setScrollPercent(0);
  }

  setScrollPercent(total) {
    const per = total % 1, t = Math.floor(total);
    const left = this.options.menuProps[t].left * (1 - per) + (this.options.menuProps[t + 1] || {
      left: 0
    }).left * per;
    const width = this.options.menuProps[t].width * (1 - per) + (this.options.menuProps[t + 1] || {
      width: 0
    }).width * per;
    this.options.line.style.left = left + 'px';
    this.options.line.style.width = width + 'px';
    this.scrollLeft = left + (width - this.clientWidth) / 2;
    if (per === 0) {
      this._active = t;
      this.update();
    }
  }

  get active() {
    return this._active || 0;
  }

  set active(i) {
    this._active = i;
    this.setScrollPercent(i);
    this.update();
  }

  onUpdate() {
    if (!this.options) return;
    removeExceptOne(this.options.menus, 'active', this.active);
  }
}

SifrrDom.register(SifrrTabHeader);
export default SifrrTabHeader;