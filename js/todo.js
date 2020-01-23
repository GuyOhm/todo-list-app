import Store from './store.js';
import Model from './model.js';
import Template from './template.js';
import View from './view.js';
import Controller from './controller.js';

/**
 * Sets up a brand new Todo list.
 *
 * @example
 * var todo = new Todo(name);
 * 
 */
class Todo {
	/**
	 * @constructor
	 * @param {string} name The name of your new to do list.
	 * 
	 */
	constructor(name) {
		/**
		 * @type {Store}
		 */
		this.storage = new Store(name);
		/**
		 * @type {Model}
		 */
		this.model = new Model(this.storage);
		/**
		 * @type {Template}
		 */
		this.template = new Template();
		/**
		 * @type {View}
		 */
		this.view = new View(this.template);
		/**
		 * @type {Controller}
		 */
		this.controller = new Controller(this.model, this.view);
	}
}

export default Todo;