import Store from './store';
import Model from './model';
import Template from './template';
import View from './template';
import Controller from './controller';

/**
 * Sets up a brand new Todo list.
 *
 * @param {string} name The name of your new to do list.
 */
class Todo {
	constructor(name) {
		this.storage = new Store(name);
		this.model = new Model(this.storage);
		this.template = new Template();
		this.view = new View(this.template);
		this.controller = new Controller(this.model, this.view);
	}
}

export default Todo;