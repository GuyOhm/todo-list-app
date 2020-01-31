	/**
	 * 
	 * This file contains helpers functions to facilitate
	 * interaction with the DOM.
	 * 
	 */
	
	/**
	 * **Query Selector**
	 * Get the first element by CSS selector
	 * 
	 * @param {string} selector The CSS selector
	 * @param {Object} scope The scope of the selection. Is evaluated 
	 * to `document` if nothing is mentionned.
	 * @returns {Element} The first element of `document` that corresponds
	 * to the selector
	 */
	export let qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * **Query Selector All**
	 * Get all elements by CSS selector
	 * 
	 * @param {string} selector The CSS selector
	 * @param {Object} scope The scope of the selection. Is evaluated 
	 * to `document` if nothing is mentionned.
	 * @returns {NodeList} A `NodeList` containing `Elements` corresponding
	 * to the selector
	 */
	export let qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * This function is an `addEventListener` wrapper
	 * 
	 * @param {Object} target The object we want to add event listener to
	 * @param {string} type The type of event
	 * @param {function} callback The callback firing upon event
	 * @param {boolean} useCapture Whether or not events of this type will
	 * be dispatched to the registered `listener` before any `EventTarget` beneath it
	 * in the DOM tree
	 */
	export let $on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * 
	 * Attach a handler to event for all elements that match the selector,
	 * now or in the future, based on a root element
	 * 
	 * @param {Object} target The elements we want to attach the handler to
	 * @param {string} selector The CSS selector
	 * @param {string} type The type of event
	 * @param {function} handler The handler attached to the selected elements
	 */
	export let $delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		$on(target, type, dispatchEvent, useCapture);
	};

	/**
	 * Find the element's parent with the given tag name:
	 * $parent(qs('a'), 'div');
	 * 
	 * @param {Object} element The element we want to find the parent of
	 * @param {string} tagName The tag name of the element
	 * @returns {Object} The parent node of the element
	 */
	export let $parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return $parent(element.parentNode, tagName);
	};

	/**
	 * Allow for looping on nodes by chaining:
	 * qsa('.foo').forEach(function () {})
	 */
	NodeList.prototype.forEach = Array.prototype.forEach;