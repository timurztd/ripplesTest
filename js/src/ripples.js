"use strict";
{
	let doc = document,
			wnd = window;

	class Ripples {
		constructor(cls) {
			this.createdRipple = null;
			this.rippleBox = null;
			this.clickFlag = false;
			this.tapFlag = false;
			// same as $ripple-duration in scss file
			this.removeRippleTimeout = 400;

			this.checkClassList();

			// listeners
			doc.addEventListener("touchstart", this.delegateCls(cls, this.newRipple));
			doc.addEventListener("mousedown", this.delegateCls(cls, this.newRipple));
			// bind Ripples obj to the removal func
			doc.addEventListener("touchend", this.removeRipple.bind(this));
			doc.addEventListener("touchcancel", this.removeRipple.bind(this));
			doc.addEventListener("touchmove", this.removeRipple.bind(this));
			doc.addEventListener("mouseup", this.removeRipple.bind(this));
			doc.addEventListener("mouseout", this.delegateMouseleave(this.removeRipple));
		}

		// http://youmightnotneedjquery.com/#has_class
		hasClass(el, cls) {
			return el.classList.contains(cls);
		}

		checkClassList() {
			if (!doc.documentElement.classList) {
				this.hasClass = function(el, cls) {
					return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
				}
			}
		}

		delegateCls(cls, func) {
			if (cls[0] === ".") cls = cls.slice(1);

			return (e) => {
				// http://stackoverflow.com/questions/7018919/how-to-bind-touchstart-and-click-events-but-not-respond-to-both
				// prevents double execution with mouse && touch
				// don't proceed if there was a click
				if (this.tapFlag) return;
				var target = e.target;

				while (!this.hasClass(target, cls)) {
					target = target.parentElement;
					// stop function if class wasn't found
					// documentElement.parentElement will return null
					if (!target) return;
				}

				func.call(target, e, this);
			}
		}

		// https://learn.javascript.ru/mousemove-mouseover-mouseout-mouseenter-mouseleave#делегирование
		delegateMouseleave(func) {
			return (e) => {
				// don't proceed if there wasn't a click
				if (!this.clickFlag) return;
				var relatedTarget = e.relatedTarget;

				while (relatedTarget) {
					if (relatedTarget === this.rippleBox) return;
					relatedTarget = relatedTarget.parentElement;
				}

				func.call(this);
			}
		}

		// // thx to https://codepen.io/pixelass/post/material-design-ripple for main idea
		newRipple(e, curObj) {
			// this === .ripple
			var posBox = this.getBoundingClientRect(),
					ePageX = e.pageX || e.touches[0].pageX,
					ePageY = e.pageY || e.touches[0].pageY,
					posX = ePageX - (posBox.left + wnd.pageXOffset),
					posY = ePageY - (posBox.top + wnd.pageYOffset),
					w = this.offsetWidth,
					h = this.offsetHeight,
					// distance from the center of the element
					offsetX = Math.abs(w / 2 - posX),
					offsetY = Math.abs(h / 2 - posY),
					// ditance to the farthest side
					deltaX = w / 2 + offsetX,
					deltaY = h / 2 + offsetY;

			// ditance to the farthest corner
			var size = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) * 2;

			curObj.appendRipple({
				top: posY,
				left: posX,
				size: size
			}, this);

			curObj.tapFlag = true;
			curObj.clickFlag = true;
			curObj.rippleBox = this;
		}

		appendRipple({ top, left, size }, rippleBox) {
			var ripple = doc.createElement("div"),
					cssStr = `width: ${size}px;
										height: ${size}px;
										top: ${top}px;
										left: ${left}px;
										margin-top: ${-size/2}px;
										margin-left: ${-size/2}px;`,
					rippleBg = rippleBox.getAttribute("data-ripple-color");

			ripple.style.cssText = cssStr;
			ripple.style.background = rippleBg;
			ripple.className += " ripple-effect";

			rippleBox.appendChild(ripple);

			this.createdRipple = ripple;
		}

		removeRipple() {
			// this === Ripples object
			// don't proceed if there wasn't a click
			if (!this.clickFlag) return;
			this.createdRipple.className += " ripple-effect-out";

			// a little bit hacky, but easier and there's less listeners
			// same as $ripple-duration in scss file or longest animation/transition
			// bind prevents possible error "the node to be removed is not a child of this node"
			setTimeout(this.rippleBox.removeChild.bind(this.rippleBox, this.createdRipple), this.removeRippleTimeout);

			this.clickFlag = false;
			// http://stackoverflow.com/questions/7018919/how-to-bind-touchstart-and-click-events-but-not-respond-to-both
			setTimeout(() => this.tapFlag = false, 100);
		}
	}

	let ripples = new Ripples("ripple");
};