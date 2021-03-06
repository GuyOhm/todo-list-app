/**
 * 
 * **The Store class is responsible for the storage of the data.**
 * 
 * The store call interacts with the localStorage of the browser
 * and makes sure that data are correcty saved, found, updated
 * and removed.
 * 
 */
class Store {
	/**
	 * 
	 * Creates a new client side storage object and will create an empty
 	 * collection if no collection already exists. If the collection already
	 * exits, we make sure the store index is updated accordingly so that we
	 * avoid id conflicts (the current solution is working as long as we can't 
	 * reorganize the todos i.e. change todos indexes).
	 * 
	 * @param {string} name The name of our DB we want to use
 	 * @param {function} callback Our fake DB uses callbacks because in
 	 * real life you probably would be making AJAX calls
	 * @example
 	 * var storage = new Store(name, callback);
	 * 
	 */
	constructor (name, callback) {

		callback = callback || function () { };
		/**
		 * @type {string}
		 */
		this._dbName = name;
		/**
		 * @type {number}
		 */
		this.index = 0;
	
		if (!localStorage[name]) {
			var data = {
				todos: []
			};
	
			localStorage[name] = JSON.stringify(data);
		}
		// 
		else if ( JSON.parse(localStorage[name]).todos.length > 0 ) {
			var todos = JSON.parse(localStorage[name]).todos;
			var lastIndex = todos.length - 1;
			this.index = todos[lastIndex].id + 1;
		}
	
		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Finds items based on a query given as a JS object
	 * 
	 * This function gets the current todos from local storage and filters
	 * each of its element and iterates through their properties to check if they match
	 * the query
	 *
	 * @param {object} query The query to match against (i.e. {foo: 'bar'})
	 * @param {function} callback	 The callback to fire when the query has
	 * completed running
	 * @returns {boolean} Whether the object has been found or not
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
	 */
	find (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Will retrieve all data from the collection
	 *
	 * @param {function} callback The callback to fire upon retrieving data
	 */
	findAll (callback) {
		callback = callback || function () { };
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 * 
	 * When a new item is created, current Store instance's index is used as unique id
	 * then index is incremented
	 * 
	 * @param {object} updateData The data to save back into the DB
	 * @param {function} callback The callback to fire after saving
	 * @param {number} id An optional param to enter an ID of an item to update.
	 */
	save (updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		
		callback = callback || function () { };

		// If an ID was actually given, find the item and update each property
		if (id !== undefined && id !== null) {
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {
			// Assign an ID
			updateData.id = this.index;
			// Increment the store index to make sure we have a unique id
			this.index ++;
			
			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Will remove an item from the Store based on its ID
	 * 
	 * This function iterates through the todos and removes the element
	 * if the id matches
	 *
	 * @param {number} id The ID of the item you want to remove
	 * @param {function} callback The callback to fire after saving
	 */
	remove (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todos.splice(i, 1);
				break;
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	/**
	 * Will drop all storage and start fresh
	 * 
	 * This function creates an empty todos and replace the current
	 * one with it
	 *
	 * @param {function} callback The callback to fire after dropping the data
	 */
	drop (callback) {
		var data = { todos: [] };
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

}

export default Store;