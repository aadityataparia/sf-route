const template = Sifrr.Dom.html`<style media="screen">
  :host {
    /* CSS for tabs container */
    line-height: 24px;
    overflow: hidden;
    width: 100%;
    display: block;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }

  .headings {
    /* CSS for heading bar */
    width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
    position: relative;
    background: #714cfe;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  }

  .headings ul {
    padding: 0 0 3px;
    margin: 0;
    font-size: 0;
  }

  /* CSS for heading text li */
  .headings *::slotted(li) {
    font-size: 16px;
    display: inline-block;
    text-align: center;
    padding: 8px;
    text-decoration: none;
    list-style: none;
    color: white;
    border-bottom: 2px solid transparent;
    opacity: 0.9;
    cursor: pointer;
    box-sizing: border-box;
  }

  .headings *::slotted(li.active) {
    opacity: 1;
  }

  .headings *::slotted(li:hover) {
    opacity: 1;
  }

  /* CSS for line under active tab heading */
  .headings .underline {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: white;
  }

  /* Arrows css */
  .arrow {
    position: absolute;
    z-index: 5;
    top: 0;
    bottom: 0;
    width: 20px;
  }

  .arrow>* {
    position: absolute;
    width: 8px;
    height: 8px;
    margin: -6px 5px;
    top: 50%;
    border: solid white;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    filter: drop-shadow(-1px -1px 3px #000);
  }

  .arrow.l {
    left: 0;
  }

  .arrow.l>* {
    left: 0;
    transform: rotate(135deg);
  }

  .arrow.r {
    right: 0;
  }

  .arrow.r>* {
    right: 0;
    transform: rotate(-45deg);
  }

  /* Tab container css */
  .content {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0;
    line-height: normal;
    box-sizing: border-box;
  }

  .content .tabs {
    min-height: 1px;
  }

  /* Tab element css */
  .content *::slotted([slot="tab"]) {
    float: left;
    max-height: 100%;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    vertical-align: top;
    padding: 8px;
    box-sizing: border-box;
  }
</style>
<div class="headings">
  <ul>
    <slot name="heading">
    </slot>
  </ul>
  <div class="underline"></div>
</div>
<div class="content">
  <div class="arrow l">
    <span></span>
  </div>
  <div class="arrow r">
    <span></span>
  </div>
  <div class="tabs">
    <slot name="tab">
    </slot>
  </div>
</div>`;

function removeExceptOne(elems, classN, index) {
  for (let j = 0; j < elems.length; j++) {
    j !== index && elems[j] !== index ? elems[j].classList.remove(classN) : elems[j].classList.add(classN);
  }
}

//Simple tabs
class SifrrTabs extends Sifrr.Dom.Element {
  static get template() {
    return template;
  }
  onConnect() {
    this.options = {
      menu: this.$(".headings ul"),
      content: this.$(".content"),
      tabcontainer: this.$(".tabs"),
      menus: this.$('slot[name=heading]').assignedNodes(),
      tabs: this.$('slot[name=tab]').assignedNodes(),
      la: this.$(".arrow.l"),
      ra: this.$(".arrow.r"),
      line: this.$(".underline"),
      num: 1,
      showArrows: false,
      arrowMargin: 0,
      showMenu: true,
      step: 1,
      tabHeight: 'auto',
      showUnderline: true,
      loop: false,
      animation: 'easeOut',
      animationTime: 150
    }
    if (this.getAttribute('options')) Object.assign(this.options, JSON.parse(this.getAttribute('options')));
    this.animations = this.animations();
    this.setWindowResizeEvent();
    this.setClickEvents();
    this.setSlotChangeEvent();
    this.refresh();
  }
  refresh(params = {}) {
    Object.assign(this.options, params);
    if (!this.options.tabs || this.options.tabs.length < 1) return;
    this.width = this.clientWidth / this.options.num;
    this.margin = 0;
    if (this.options.showArrows) {
      this.width -= 2 * this.options.arrowMargin;
      this.margin = this.options.arrowMargin;
    }
    this.setProps();
    this.active = params.active || this.active || 0;
  }
  get active() {
    return this.state ? this.state.active : 0;
  }
  set active(i) {
    this.state = {
      active: i
    };
  }
  onStateChange() {
    if (!this.options) return;
    let i = this.state.active;
    i = this.getTabNumber(i);
    if (i + this.options.num - 1 == this.options.tabs.length) {
      if (this.options.loop) i = 0;
      else i = this.options.tabs.length - this.options.num;
    }
    if (i !== this.state.active) {
      this.state = {
        active: i
      };
      return;
    }
    this.animate(this.options.content, 'scrollLeft', i * (this.width + 2 * this.margin), this.options.animationTime, this.options.animation);
    removeExceptOne(this.options.tabs, 'active', i);
    removeExceptOne(this.options.tabs, 'prev', this.getTabNumber(i - 1));
    removeExceptOne(this.options.tabs, 'next', this.getTabNumber(i + 1));
    removeExceptOne(this.options.menus, 'active', i);
    removeExceptOne(this.options.menus, 'prev', this.getTabNumber(i - 1));
    removeExceptOne(this.options.menus, 'next', this.getTabNumber(i + 1));
    if (this.options.showArrows) {
      this.options.la.style.display = this.hasPrev() || this.options.loop ? "block" : "none";
      this.options.ra.style.display = this.hasNext() || this.options.loop ? "block" : "none";
    }
  }
  next() {
    this.active = this.state.active + this.options.step;
  }
  hasNext() {
    if (this.active === this.options.tabs.length - this.options.num) return false;
    return true;
  }
  prev() {
    this.active = this.state.active - this.options.step;
  }
  hasPrev() {
    if (this.active === 0) return false;
    return true;
  }
  getTabNumber(i) {
    const l = this.options.tabs.length;
    i = i < 0 ? i + l : i % l
    return i;
  }
  setProps() {
    const me = this;
    if (!this.options.showArrows) {
      if (this.options.la) this.options.la.style.display = 'none';
      if (this.options.ra) this.options.ra.style.display = 'none';
    } else {
      Array.from(this.options.tabs).forEach(e => e.style.margin = `0 ${this.margin}px`);
    }
    if (!this.options.showUnderline) {
      if (this.options.line) this.options.line.style.display = 'none';
    }
    if (this.options.showMenu) {
      this.setMenuProps();
      this.options.line.style.width = this.options.menus[0].offsetWidth + 'px';
    } else {
      if (this.options.menu) this.options.menu.style.display = 'none';
    }
    this.setScrollEvent();
    this.options.tabcontainer.style.width = this.options.tabs.length * (this.width + 2 * this.margin) + 'px';
    this.options.tabcontainer.style.height = this.options.tabHeight;
    Array.from(this.options.tabs).forEach(e => e.style.width = this.width + 'px');
  }
  setMenuProps() {
    const me = this;
    let left = 0;
    this.options.menuProps = {};
    Array.from(this.options.menus).forEach((elem, i) => {
      this.options.menuProps[i] = {
        width: elem.offsetWidth,
        left: left
      }
      left += elem.offsetWidth;
      elem.$click = () => me.active = i;
    });
    const last = this.options.menuProps[this.options.menus.length - 1];
    this.options.menu.style.width = last.left + last.width + 5 + 'px';
    const active = this.options.menuProps[this.active];
    if (active) {
      me.options.line.style.left = active.left + 'px';
      me.options.line.style.width = active.width + 'px';
    }
  }
  setClickEvents() {
    let me = this;
    if (this.options.la) this.options.la.$click = () => me.prev();
    if (this.options.ra) this.options.ra.$click = () => me.next();
  }
  setScrollEvent() {
    let me = this,
      isScrolling;
    me.options.content.onscroll = () => requestAnimationFrame(onScroll);

    function onScroll() {
      const total = me.options.content.scrollLeft / me.width;
      const per = total % 1;
      const t = Math.floor(total);
      try {
        const left = me.options.menuProps[t].left * (1 - per) + (me.options.menuProps[t + 1] || {
          left: 0
        }).left * per;
        const width = me.options.menuProps[t].width * (1 - per) + (me.options.menuProps[t + 1] || {
          width: 0
        }).width * per;
        me.options.line.style.left = left + 'px';
        me.options.line.style.width = width + 'px';
        me.options.menu.parentElement.scrollLeft = left - (me.width - width) / 2;
      } catch (e) {}
      clearTimeout(isScrolling);
      isScrolling = setTimeout(function() {
        if (per >= 0.5) {
          me.active = t + 1;
        } else {
          me.active = t;
        }
      }, 66);
    }
  }
  setWindowResizeEvent() {
    const me = this;
    window.addEventListener("resize", function() {
      me.refresh();
    });
  }
  setSlotChangeEvent() {
    const me = this;
    const fxn = () => {
      me.options.menus = me.$$('slot')[0].assignedNodes();
      me.options.tabs = me.$$('slot')[1].assignedNodes();
      me.refresh();
    }
    this.$$('slot')[0].addEventListener('slotchange', fxn);
    this.$$('slot')[1].addEventListener('slotchange', fxn);
  }
  animate(who, what, to, time, type = 'easeOut') {
    const from = who[what];
    const diff = to - from;
    const step = 1 / Math.round(time / 16) * diff;
    const me = this;
    let pos = 0,
      raf, startTime;

    function frame(currentTime) {
      startTime = startTime || currentTime;
      if (currentTime - startTime > time) {
        who[what] = to;
        return;
      }
      let percent = (currentTime - startTime) / time;
      who[what] = Math.round(me.animations[type].call(this, percent) * diff + from);
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  animations() {
    return {
      linear: i => i,
      easeOut: i => (--i) * i * i + 1,
      easeIn: i => i * i * i,
      none: i => 1
    }
  }
}
Sifrr.Dom.register(SifrrTabs);