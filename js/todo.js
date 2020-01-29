import Store from './store.js';
import Model from './model.js';
import Template from './template.js';
import View from './view.js';
import Controller from './controller.js';

/**
 * 
 * **The Todo class represents a list of todos.**
 * 
 * The todo class is responible for creating the main
 * object instances needed for the app to work.
 * 
 */
class Todo {
	/**
	 * 
	 * Sets up a brand new Todo list.
	 * @param {string} name The name of your new to do list.
	 * @example
	 * var todo = new Todo(name);
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