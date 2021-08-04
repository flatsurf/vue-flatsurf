/* ******************************************************************************
 * Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * *****************************************************************************/

import assert from "assert";

import { optimize } from "svgo/dist/svgo.browser.js";

/*
 * Turns an <svg> in an HTML document into a standalone svg.
 */
export default class SVGExporter {
  constructor(svg: Element) {
    this.svg = svg.cloneNode(true) as Element;
    this.styles = [...svg.getElementsByTagName("*")].map(this.computedStyle);

    if (this.svg.tagName !== 'svg') {
      this.styles.unshift(this.computedStyle(svg));

      svg = document.createElement('svg');
      svg.appendChild(this.svg);
      this.svg = svg;
    }

    this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }

  private get children() {
    return this.svg.getElementsByTagName("*");
  }

  private computedStyle(element: Element) {
    const style = window.getComputedStyle(element);
    const computed = {} as { [key: string]: string };
    for (let i = 0; i < style.length; i++)
      computed[style[i]] = style.getPropertyValue(style[i]);
    return computed;
  }

  /*
   * Return the index of `e` in `styles`.
   */
  private index(e: Element) {
    const children = this.children;
    assert(children.length == this.styles.length);

    for (let index = 0; index < children.length; index++) {
      if (children[index] === e)
        return index;
    }

    throw Error("Element not found in DOM tree.")
  }

  /*
   * Drop all class="" attributes from all elements.
   */
  public dropClasses() {
    for (const child of this.children) {
      child.removeAttribute('class');
    }
  }

  /*
   * Drop all prefixed styles from all elements, i.e., things such as
   * `-webkit-...` and `--variable`.
   */
  public dropPrefixedStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, _value]) => !key.startsWith('-'))
      );
    });
  }

  /*
   * Drop all elements that are not visible from the element tree.
   */
  public dropInvisible() {
    const children = this.children;
    assert(children.length === this.styles.length);

    const trash = {} as {[index: number]: Element};

    const add = (element: Element) => {
      const index = this.index(element);

      if (index in trash)
        return;
      trash[index] = element;

      [...element.children].forEach(add);
    };

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      const style = this.styles[index];
      if (style["visibility"] === "hidden" || style["display"] === "none")
        add(child);
    }

    this.styles = this.styles.filter((_style, i) => !(i in trash));

    for (const element of Object.values(trash)) {
      if (element.parentNode != null) {
        element.parentNode.removeChild(element);
      }
    }

    assert(children.length === this.styles.length);

    // Now we can drop all "visibility: visible" and "display: " which has no
    // effect in SVG anymore.
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, _value]) => key !== "visibility" && key !== "display")
      );
    });
  }

  /*
   * Drop styling that is already equally set on the parent node.
   */
  public dropRedundantStyles() {
    const children = this.children;
    assert(children.length === this.styles.length);

    for (let index = children.length; index--;) {
      const child = children[index];
      const parent = child.parentNode as Element;

      assert(parent != null);
      if (parent === this.svg) continue;

      const style = this.styles[this.index(parent)];
      this.styles[index] = Object.fromEntries(
        Object.entries(this.styles[index]).filter(([key, value]) => style[key] != value)
      );
    }
  }

  /*
   * Drop custom attributes such as `data-attribute=""`.
   */
  public dropCustomAttributes() {
    for (const child of this.children) {
      [...child.attributes].forEach((attribute) => {
        if (attribute.name.includes('-'))
          child.removeAttribute(attribute.name);
      });
    }
  }

  /*
   * Drop styles that are inherited from the browser but have no meaning in SVG.
   */
  public dropBrowserStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, _value]) => {
          // flex styles
          if (key.startsWith('align-'))
            return false;
          if (key.startsWith('flex-'))
            return false;
          // grid styles
          if (key.startsWith('grid-'))
            return false;
          if (key.startsWith('column-'))
            return false;
          if (key.startsWith('row-'))
            return false;
          // HTML styles
          if (key.startsWith('padding'))
            return false;
          if (key.startsWith('margin'))
            return false;
          if (key.startsWith('background'))
            return false;
          if (key.startsWith('border'))
            return false;
          if (key.startsWith('scroll'))
            return false;
          if (key.startsWith('overscroll'))
            return false;
          if (key.startsWith('overflow'))
            return false;
          if (key.startsWith('counter'))
            return false;
          if (key.startsWith('object-'))
            return false;
          if (key === 'float')
            return false;
          if (key === 'clear')
            return false;
          return true;
        })
      );
    });
  }

  /*
   * Drop styles that are only used for interaction and animations.
   */
  public dropInteractiveStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, _value]) => {
          if (key == 'user-select')
            return false;
          if (key.startsWith('animation'))
            return false;
          if (key.startsWith('transition'))
            return false;
          if (key.startsWith('touch'))
            return false;
          if (key.startsWith('offset'))
            return false;
          if (key === 'pointer-events')
            return false;
          if (key === 'cursor')
            return false;
          return true;
        })
      );
    });
  }

  /*
   * Inline all styling into the elements `style` attribute.
   * This is usually the last method to call before `toString()`.
   */
  public inlineStyles() {
    const children = this.children;
    assert(children.length == this.styles.length);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const style = Object.entries(this.styles[i]).map(([key, value]) => {
        return `${key}: ${value};`
      }).join(" ");
      if (style)
        child.setAttribute('style', style);
      else
        child.removeAttribute('style');
    }
  }

  /*
   * Return the extracted SVG as a string.
   */
  public toString(svgo: boolean = true) {
    let svg = this.svg.outerHTML;
    if (svgo)
      svg = optimize(svg).data;
    return svg;
  }

  // A clone of the original SVG node from the DOM.
  private svg: Element;

  // The computed style of each node in the original SVG node in traversal order.
  private styles: Array<{ [key: string]: string }> = [];
}
