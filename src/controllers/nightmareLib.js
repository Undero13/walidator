/** @module nightmareLib */
/* eslint-disable */

/**
 * Check element is visible
 * @param {HTMLElement} element
 * @returns {boolean}
 */
const checkVisible = ({ offsetWidth, offsetHeight }) => offsetWidth > 0 && offsetHeight > 0;

/**
 * Get getBoundingClientRect for overlap
 * @param {HTMLElement} element
 * @returns {Array<object>}
 */
const getPositions = (element) => {
  const clientRect = element.getBoundingClientRect();
  return [
    [clientRect.left, clientRect.left + clientRect.width],
    [clientRect.top, clientRect.top + clientRect.height],
  ];
};

/**
 * The elements do not overlap
 * @param {HTMLCollection} elements
 * @returns {Array<Array<string>>}
 */
const checkOverlap = (elements) => {
  const lenght = elements.length;
  const overlap = [];

  for (let i = 0; i < lenght; i++) {
    if (i + 1 === lenght) break;

    if (!elements[i].contains(elements[i + 1])) {
      const posA = getPositions(elements[i]);
      const posB = getPositions(elements[i + 1]);

      if (
        posA[0][0] < posB[0][1]
        && posA[0][1] > posB[0][0]
        && posA[1][0] < posB[1][1]
        && posA[1][1] > posB[1][0]
      ) {
        const identifier1 = elements[i].className || elements[i].id || elements[i].textContent;
        const identifier2 = elements[i + 1].className
          || elements[i + 1].id
          || elements[i + 1].textContent;

        overlap.push([identifier1, identifier2]);
      }
    }
  }

  return overlap;
};

/**
 * Get background from element
 * @param {HTMLElement} element
 * @param {string} attr
 * @returns {string}
 */
const getStyle = (element, attr) => window.getComputedStyle(element, null).getPropertyValue(attr);

/**
 * If element don't have backgroung get it from parent
 * @param {HTMLElement} element
 * @returns {string}
 */
const getBackground = (element) => {
  let res = getStyle(element, 'background-color');
  while (
    !res
    || res === 'transparent'
    || res === '#000000'
    || res === 'rgba(0, 0, 0, 0)'
  ) {
    if (element === document.body) res = '#fff';
    else res = getBackground(element.parentNode, 'background-color');
  }
  return res;
};

/**
 * Return css style
 * @param {HTMLElement} element
 * @returns {object}
 */
const getAllStyles = (elm) => {
  const styles = getComputedStyle(elm, null);

  return Array.from(styles).map((style) => {
    const obj = {};
    obj[style] = styles.getPropertyValue(style);
    return obj;
  });
};

/**
 * Compare to object
 * @param {object} x
 * @param {object} y
 * @returns {boolean}
 */
const obiectsAreSame = (x, y) => {
  const keyX = Object.keys(x)[0];
  const keyY = Object.keys(y)[0];

  if (keyX === keyY && x[keyX] !== y[keyY]) {
    return true;
  }

  return false;
};

/**
 * Get keyframes
 * @param {string} name
 * @returns {CSSRuleList|boolean}
 */
const getAnimation = (name) => {
  let rule;
  const ss = document.styleSheets;

  for (let i = 0; i < ss.length; ++i) {
    for (let x = 0; x < ss[i].cssRules.length; ++x) {
      rule = ss[i].cssRules[x];

      if (rule.name === name && rule.type === CSSRule.KEYFRAMES_RULE) {
        return rule;
      }
    }
  }

  return false;
};

/**
 * Check animation gleam (no more than 3 times per 1 sec)
 * @param {CSSRuleList} rule
 * @param {number} time
 * @param {number} counter
 * @returns {boolean}
 */
const checkAnimation = (rule, time, counter) => {
  const subject = {
    opacity: 0,
    color: 0,
    background: 0,
  };

  const keyframes = [...rule.cssRules];

  keyframes.forEach((frame) => {
    if (frame.cssText.includes('opacity')) subject.opacity++;
    else if (frame.cssText.includes('color')) subject.color++;
    else if (frame.cssText.includes('background')) subject.background++;
  });

  if (
    time < 1
    && (subject.opacity > 3 || subject.color > 3 || subject.background > 3)
  ) {
    return false;
  }
  if (
    time < 1
    && counter > 3
    && (subject.opacity > 0 || subject.color > 0 || subject.background > 0)
  ) {
    return false;
  }

  return true;
};

/**
 * Get background,color and font-size and few others
 * @param {HTMLCollection} elements
 * @param {boolean} interactive
 * @returns {object|null}
 */
const getStyleFormDom = (elements, interactive = false) => {
  if (elements.length < 1) return [];

  const properties = [];

  elements.forEach((elm) => {
    const styleFont = getStyle(elm, 'font-size');
    const styleColor = getStyle(elm, 'color');
    const inspection = [];
    let styleBefore;
    let styleAfterFocus;

    if (interactive && checkVisible(elm)) {
      styleBefore = getAllStyles(elm);
      elm.focus();
      styleAfterFocus = getAllStyles(document.activeElement);

      styleBefore.forEach((x) => {
        styleAfterFocus.forEach((y) => {
          const value = obiectsAreSame(x, y);
          if (value) {
            inspection.push(value);
          }
        });
      });
    }

    properties.push({
      el: elm.outerHTML,
      textContent: elm.textContent,
      fontSize: styleFont,
      color: styleColor || '#000',
      background: getBackground(elm),
      inputLabel: !!(elm.labels && elm.labels.length > 0),
      correctFocus: !!(inspection.length > 0),
    });
  });
  return properties;
};

/**
 * Return invalid animated element
 * @throws {Error} if site block analize css
 * @returns {array<string>}
 */
const getAnimationElement = () => {
  const elements = [...document.body.getElementsByTagName('*')];
  const notValidElements = [];

  try {
    elements.forEach((element) => {
      const animatedStyle = getStyle(element, 'animation-name');
      const animationTime = parseFloat(getStyle(element, 'animation-duration'));
      const animationCount = getStyle(element, 'animation-iteration-count') === 'infinite'
        ? 999
        : parseInt(getStyle(element, 'animation-iteration-count'), 10);
      const animationName = animatedStyle !== 'none' ? animatedStyle : false;
      if (animationName) {
        const rule = getAnimation(animationName);
        const isValid = checkAnimation(rule, animationTime, animationCount);

        if (!isValid) {
          notValidElements.push(element.outerHTML);
        }
      }
    });
  } catch (e) {
    notValidElements.push('blocker');
  }

  return notValidElements;
};

/**
 * Enlarge fonts 2 times and check overlap
 * @returns {function}
 */
const enlargeFonts = () => {
  const elements = document.querySelectorAll(
    'p,a,button,input,h1,h2,h3,h4,h5,h6,span',
  );

  const enlargeElements = [];

  elements.forEach((element) => {
    if (element.textContent) {
      const fontSize = getStyle(element, 'font-size');
      const currentSize = parseFloat(fontSize);
      element.style.fontSize = `${currentSize * 2}px`;

      enlargeElements.push(element);
    }
  });

  return checkOverlap(enlargeElements);
};

const clearURL = () => {
  const url = location.origin;
  const urlWithoutHttp = url.replace(/^(?:https?:\/\/)?(?:www\.)?/gi, '');
  const urlWithoutSlash = urlWithoutHttp.replace('/', '');
  const test = urlWithoutSlash.split('.').length;
  let clearUrl = urlWithoutSlash;

  for (let i = 1; i < test; i++) {
    clearUrl = clearUrl.replace(/([.]\w+)$/, '');
  }

  return clearUrl;
};

/**
 * Detect potential modal/popup element in site
 */
const getPotentialModal = () => {
  const elements = document.body.querySelectorAll(
    '*:not(script):not(style):not(svg):not(noscript):not(p)',
  );

  const potentialModal = [];

  elements.forEach((element) => {
    if (
      checkVisible(element)
      && (getStyle(element, 'position') === 'absolute'
        || getStyle(element, 'position') === 'fixed')
    ) {
      potentialModal.push({
        el: element.outerHTML,
        zIndex:
          getStyle(element, 'z-index') === 'auto'
            ? 0
            : parseInt(getStyle(element, 'z-index'), 10),
      });
    }
  });

  const max = potentialModal.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current));

  if (max.zIndex > 0) {
    return max;
  }

  return {};
};

window.getStyleFormDom = getStyleFormDom;
window.getAnimationElement = getAnimationElement;
window.enlargeFonts = enlargeFonts;
window.clearURL = clearURL;
window.getPotentialModal = getPotentialModal;
