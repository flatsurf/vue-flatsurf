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
import rgba from "color-normalize";

/*
 * Turns an <svg> in an HTML document into a standalone svg.
 */
export default class SVGExporter {
  constructor(svg: Element) {
    this.svg = svg.cloneNode(true) as Element;
    this.styles = [svg, ...svg.getElementsByTagName("*")].map(this.computedStyle);

    if (this.svg.tagName !== 'svg') {
      svg = document.createElement('svg');
      svg.appendChild(this.svg);
      this.svg = svg;

      this.styles.unshift({});
    }

    this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }

  private get children() {
    return [this.svg, ...this.svg.getElementsByTagName("*")];
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

    const addToTrash = (element: Element) => {
      const index = this.index(element);

      if (index in trash)
        return;
      trash[index] = element;

      [...element.children].forEach(addToTrash);
    };

    for (let index = 1; index < children.length; index++) {
      const child = children[index];
      const style = this.styles[index];
      if (style["visibility"] === "hidden" || style["display"] === "none")
        addToTrash(child);
    }

    this.styles = this.styles.filter((_style, i) => !(i in trash));

    for (const element of Object.values(trash)) {
      if (element.parentNode != null) {
        element.parentNode.removeChild(element);
      }
    }

    assert(this.children.length === this.styles.length);

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

      if (parent == null) continue;

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

  private static readonly standard = [ "cx", "cy", "height", "width", "x", "y", "r", "rx", "ry", "d", "fill", "transform", "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-rendering", "cursor", "direction", "display", "dominant-baseline", "fill-opacity", "fill-rule", "filter", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "paint-order", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-anchor", "text-decoration", "text-overflow", "text-rendering", "unicode-bidi", "vector-effect", "visibility", "white-space", "word-spacing", "writing-mode", "display", "overflow", "visibility", "text-overflow", "clip-path", "clip-rule", "mask", "color", "opacity", "color-interpolation-filters", "filter", "flood-color", "flood-opacity", "lighting-color", "isolation", "transform", "transform-box", "transform-origin", "letter-spacing", "text-align", "text-align-last", "text-indent", "word-spacing", "white-space", "vertical-align", "dominant-baseline", "alignment-baseline", "baseline-shift", "direction", "text-orientation", "writing-mode", "font", "text-decoration", "text-decoration-line", "text-decoration-style", "text-decoration-color"];

  /*
   * Drop styles that are not explititly supported by SVG 2, see
   * https://www.w3.org/TR/SVG/styling.html#RequiredProperties
   */
  public dropNonStandardStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, _value]) => {
          if (SVGExporter.standard.includes(key))
            return true;
          if (key.startsWith("font-"))
            return true;
        })
      )
    });
  }

  /*
   * Rewrite style as presentation attributes.
   * Drop all styles that can be presentation attributes from elements where they are not allowed.
   * This helps some SVG readers and also svgo to optimize the output.
   */
  public usePresentationAttributes() {
    const children = this.children;
    assert(children.length === this.styles.length);

    for (let index = children.length; index--;) {
      const child = children[index];

      const makePresentation = (key: string, value: string) => {
        if (!child.hasAttribute(key))
          child.setAttribute(key, value);
      };

      this.styles[index] = Object.fromEntries(
        Object.entries(this.styles[index]).filter(([key, value]) => {
          if (["cx", "cy"].includes(key)) {
            if (["circle", "ellipse"].includes(child.tagName))
              return makePresentation(key, value);
            return false;
          } else if (["height", "width", "x", "y"].includes(key)) {
            if (["foreignObject", "image", "rect", "svg", "symbol", "use"].includes(child.tagName))
              return makePresentation(key, value);
            return false;
          } else if (["r"].includes(key)) {
            if (["circle"].includes(child.tagName))
              return makePresentation(key, value);
            return false;
          } else if (["rx", "ry"].includes(key)) {
            if (["ellipse", "rect"].includes(child.tagName))
              return makePresentation(key, value);
            return false;
          } else if (["d"].includes(key)) {
            if (["path"].includes(child.tagName))
              makePresentation(key, value);
            return false;
          } else if (["fill"].includes(key)) {
            if (!["animate", "set", "animateMotion"].includes(child.tagName))
              makePresentation(key, value);
            return false;
          } else if (["transform"].includes(key) && value != "none") {
            if (!["pattern", "linearGradien", "radialGradient"].includes(child.tagName))
              makePresentation(key, value);
            else if (["pattern"].includes(child.tagName))
              makePresentation("patternTransform", value);
            else if (["linearGradient", "radialGradient"].includes(child.tagName))
              makePresentation("gradientTransform", value);
            return false;
          } else if (["alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-rendering", "cursor", "direction", "display", "dominant-baseline", "fill-opacity", "fill-rule", "filter", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "paint-order", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-anchor", "text-decoration", "text-overflow", "text-rendering", "unicode-bidi", "vector-effect", "visibility", "white-space", "word-spacing", "writing-mode"].includes(key)) {
            makePresentation(key, value);
            return false;
          }
          return true;
        })
      );
    }
  }
  public simplifyColors() {
    const children = this.children;
    assert(children.length === this.styles.length);

    const simplify = (child: Element, style: {[key: string]: string}, key: string, okey: string | null = null) => {
      if (child.getAttribute(key))
        delete style[key];
      if (okey != null && child.getAttribute(okey))
        delete style[okey];

      const value = style[key];
      if (value == null || value == "none")
        return;

      const color = rgba(value);
      const opacity = color[3];
      if (okey != null) {
        style[okey] = String(Number(child.getAttribute(okey) || style[okey] || 1) * opacity);
        child.removeAttribute(okey);
      }

      style[key] = `rgb(${color[0]*255}, ${color[1]*255}, ${color[2]*255})`;
    };

    for (let index = children.length; index--;) {
      const child = children[index];
      const style = this.styles[index];

      simplify(child, style, "fill", "fill-opacity");
      simplify(child, style, "stroke", "stroke-opacity");
      simplify(child, style, "color");
      simplify(child, style, "text-decoration");
      simplify(child, style, "text-decoration-color");

      this.styles[index] = style;
    }
  }

  /*
   * Drop trivial styles.
   */
  public dropTrivialStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, value]) => {
          if (key == "transform" && value == "none")
            return false;
          if (key == "filter" && value == "none")
            return false;

          return true;
        })
      )
    });
  }

  /*
   * Drop styles that confuse inkscape (as of 1.1)
   */
  public dropNonInkscapeStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, value]) => {
          if (key == "font-synthesis")
            return false;
          if (key == "vertical-align")
            return false;
          if (key == "transform-origin")
            return false;
          if (key == "transform-box")
            return false;
          if (key == "text-overflow")
            return false;
          if (key == "text-align-last")
            return false;
          if (key == "mask")
            return false;
          if (key == "font-optical-sizing")
            return false;
          if (key == "font-language-override")
            return false;
          if (key == "font-kerning")
            return false;
          if (key == "clip-path")
            return false;
          if (key == "transform" && value == "none")
            return false;

          if (SVGExporter.standard.includes(key))
            return true;
          if (key.startsWith("font-"))
            return true;
        })
      )
    });
  }

  public dropInteractiveStyles() {
    this.styles = this.styles.map((styles) => {
      return Object.fromEntries(
        Object.entries(styles).filter(([key, _value]) => {
          if (key == "cursor")
            return false;
          if (key == "pointer-events")
            return false;

          return true;
        })
      )
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
