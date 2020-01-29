import Todo from './todo.js';
import {$on} from './helpers.js';

/**
 * app.js is the entry point for the web application.
 * 
 * Creates a new Todo object.
 * @example
 * var todo = new Todo(<name>)
 */
var todo = new Todo('todos-vanillajs');

/**
 * Loads and initializes the view for the new created Todo
 */
function setView() {
	todo.controller.setView(document.location.hash);
}

$on(window, 'load', setView);
$on(window, 'hashchange', setView);