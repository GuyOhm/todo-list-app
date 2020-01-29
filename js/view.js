import {qs, qsa, $on, $parent, $delegate} from './helpers.js';
import Template from './template.js';

/**
		 * **View that abstracts away the browser's DOM completely.**
		 * 
		 * It has two simple entry points:
		 *
		 *   - bind(eventName, handler)
		 *     Takes a todo application event and registers the handler
		 *   - render(command, parameterObject)
		 *     Renders the given command with the options
		 */
class View {
	/**
	 * 
	 * Creates a new View instance and hook up HTML elements
	 * @param {Template} template
	 * @example
	 * var view = new View(template);
	 */
	constructor(template) {
		/**
		 * @type {Template}
		 */
		this.template = template;
		/**
		 * @type {number}
		 */
		this.ENTER_KEY = 13;
		/**
		 * @type {number}
		 */
		this.ESCAPE_KEY = 27;
		/**
		 * @type {function}
		 */
		this.$todoList = qs('.todo-list');
		/**
		 * @type {function}
		 */
		this.$todoItemCounter = qs('.todo-count');
		/**
		 * @type {function}
		 */
		this.$clearCompleted = qs('.clear-completed');
		/**
		 * @type {function}
		 */
		this.$main = qs('.main');
		/**
		 * @type {function}
		 */
		this.$footer = qs('.footer');
		/**
		 * @type {function}
		 */
		this.$toggleAll = qs('.toggle-all');
		/**
		 * @type {function}
		 */
		this.$newTodo = qs('.new-todo');
	}
	
	/**
	 * 
	 * @param {number} id 
	 */
	_removeItem (id) {
		var elem = qs('[data-id="' + id + '"]');
	
		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * 
	 * @param {*} completedCount 
	 * @param {*} visible 
	 */
	_clearCompletedButton (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};
	
	/**
	 * 
	 * @param {*} currentPage 
	 */
	_setFilter (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};
	
	/**
	 * 
	 * @param {number} id 
	 * @param {*} completed 
	 */
	_elementComplete (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');
	
		if (!listItem) {
			return;
		}
	
		listItem.className = completed ? 'completed' : '';
	
		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};
	
	/**
	 * 
	 * @param {number} id 
	 * @param {string} title 
	 */
	_editItem (id, title) {
		var listItem = qs('[data-id="' + id + '"]');
	
		if (!listItem) {
			return;
		}
	
		listItem.className = listItem.className + ' editing';
	
		var input = document.createElement('input');
		input.className = 'edit';
	
		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};
	
	/**
	 * 
	 * @param {number} id 
	 * @param {string} title 
	 */
	_editItemDone (id, title) {
		var listItem = qs('[data-id="' + id + '"]');
	
		if (!listItem) {
			return;
		}
	
		var input = qs('input.edit', listItem);
		listItem.removeChild(input);
	
		listItem.className = listItem.className.replace('editing', '');
	
		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};
	
	/**
	 * 
	 * @param {*} viewCmd 
	 * @param {*} parameter 
	 */
	render (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};
	
		viewCommands[viewCmd]();
	};
	
	/**
	 * 
	 * @param {*} element
	 * @returns
	 */
	_itemId (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};
	
	/**
	 * 
	 * @param {*} handler 
	 */
	_bindItemEditDone (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});
	
		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};
	
	/**
	 * 
	 * @param {*} handler 
	 */
	_bindItemEditCancel (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();
	
				handler({ id: self._itemId(this) });
			}
		});
	};
	
	/**
	 * 
	 * @param {*} event 
	 * @param {*} handler 
	 */
	bind (event, handler) {
		var self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});
	
		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});
	
		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({ completed: this.checked });
			});
	
		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({ id: self._itemId(this) });
			});
	
		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({ id: self._itemId(this) });
			});
	
		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});
	
		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);
	
		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

}

export default View;