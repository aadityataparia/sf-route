/*! SifrrInclude v0.0.5 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-elements */
import SifrrDom from '@sifrr/dom';

class SifrrInclude extends SifrrDom.Element {
  static syncedAttrs() {
    return ['url', 'type'];
  }
  onConnect() {
    let preffix = '', suffix = '';
    if (this.type === 'js') {
      preffix = '<script>';
      suffix = '</script>';
    } else if (this.type === 'css') {
      preffix = '<style>';
      suffix = '</style>';
    }
    if (this.url) {
      fetch(this.url).then(r => r.text()).then(text => {
        this.innerHTML = preffix + text + suffix;
      });
    }
  }
}
SifrrDom.register(SifrrInclude);

export default SifrrInclude;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrrinclude.module.js.map
