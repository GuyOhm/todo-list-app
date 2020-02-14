import Controller from '../js/controller.js';
/*global app, jasmine, describe, it, beforeEach, expect */

/**
 * @test {Controller}
 */
describe('controller', function () {
	'use strict';

	/**
	 * Declare variables
	 * Note: subject corresponds to the test subject i.e. the controller
	 */
	var subject, model, view;

	/**
	 * Fake a model class with its methods
	 * @param {Object[]} todos A list of todos
	 */
	var setUpModel = function (todos) {
		/**
		 * Fake the read method
		 * query is optional
		 * 
		 * model is a spy with a read method that doesn't filter = findAll()
		 */
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		/**
		 * Fake a getCount method
		 */
		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		/**
		 * Fake a remove method
		 */
		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		/**
		 * Fake a create method
		 */
		model.create.and.callFake(function (title, callback) {
			callback();
		});

		/**
		 * Fake an update methods
		 */
		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	/**
	 * Fake a view class
	 */
	var createViewStub = function () {
		var eventRegistry = {};
		return {
			// Create a spy 'render' to fake rendering of the view
			render: jasmine.createSpy('render'),
			// Emulate binding views element with event listener
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			// Emulate clicks on View's elements programmatically
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	/**
	 * Fake classes instanciations before running each test
	 */
	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new Controller(model, view);
	});

	it('should show entries on start-up', function () {
		/**
		 * @done Write test
		 */
		var todo = { title: 'my todo' };
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		

	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = { title: 'my todo' };
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = { title: 'my todo' };
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries', function () {
			/**
			 * @done Write test
			 * 
			 * NOTE: we created 2 todos with different completed state to show that the fake model
			 * doesn't filter so that the test doesn't pass if we expect the view to render only
			 * the todos with completed: false. Though we use any(Array)
			 */
			var todo = { title: 'my todo', completed: false };
			var todo2 = { title: 'my todo', completed: true };
			setUpModel([todo, todo2]);

			subject.setView('#/active');

			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));
			expect(view.render).toHaveBeenCalledWith('showEntries', jasmine.any(Array));
		});

		it('should show completed entries', function () {
			/**
			 * @done Write test
			 * 
			 * NOTE: we created 2 todos with different completed state to show that the fake model
			 * doesn't filter so that the test doesn't pass if we expect the view to render only
			 * the todos with completed: true. Though we use any(Array)
			 */
			var todo = { title: 'my todo', completed: false };
			var todo2 = { title: 'my todo', completed: true };
			setUpModel([todo, todo2]);

			subject.setView('#/completed');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(view.render).toHaveBeenCalledWith('showEntries', jasmine.any(Array));
		});
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = { id: 42, title: 'my todo', completed: true };
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		/**
		 * @done Write test
		 * 
		 * If "All" is highlighted by default:
		 * - setFilter is called with '' as a parameter
		 * - the view route is ''
		 * 
		 */
		var todo = {id: 3, title: 'todo', completed: false};
		setUpModel([todo]);
		
		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('setFilter', '');
	});

	it('should highlight "Active" filter when switching to active view', function () {
		/**
		 * @done Write test
		 * 
		 * If "Active" is highlighted:
		 * - setFilter is called with 'active' as a parameter
		 * - the view route is '#/active'
		 * 
		 */
		var todo = { title: 'my todo', completed: false };
		var todo2 = { title: 'my todo', completed: true };
		setUpModel([todo, todo2]);

		subject.setView('#/active');

		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
	});

	describe('toggle all', function () {
		it('should toggle all todos to completed', function () {
			/**
			 * @done Write test
			 * 
			 * We create several todos
			 * We emulate the event 'toggleAll' trigged by the view
			 * If this event toggles all todos to completed it means that
			 * all todos are updated to completed: true
			 * 
			 */
			var todo = {id: 17, title: 'my todo', completed: false };
			var todo2 = {id: 23, title: 'my todo', completed: false };
			var todo3 = {id: 42, title: 'my todo', completed: true };
			const todos = [todo, todo2, todo3];
			setUpModel(todos);

			subject.setView('');
			view.trigger('toggleAll', {completed: true});

			for (const task of todos) {
				expect(model.update).toHaveBeenCalledWith(task.id, {completed: true}, jasmine.any(Function));
			}
			
		});

		it('should update the view', function () {
			/**
			 * @done Write test
			 * 
			 * We create several todos
			 * We emulate the event 'toggleAll' trigged by the view
			 * If the view is updated accordingly it renders with 'elementComplete'
			 * passing uncompleted todos to true
			 * 
			 */
			var todo = {id: 17, title: 'my todo', completed: false };
			var todo2 = {id: 23, title: 'my todo', completed: false };
			var todo3 = {id: 42, title: 'my todo', completed: true };
			const todos = [todo, todo2, todo3];
			setUpModel(todos);

			subject.setView('');
			view.trigger('toggleAll', {completed: true});

			todos.map(task => {
				if (!task.completed) {
					expect(view.render).toHaveBeenCalledWith('elementComplete', {
						id: task.id,
						completed: true
					});
				}
			});
		});
	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			/**
			 * @done Write test
			 * 
			 * Test passes if the create method of the model is called with:
			 * - the new todo title
			 * - a callback
			 * 
			 */
			setUpModel([]);

			subject.setView('');
			view.trigger('newTodo', 'This is a todo');

			expect(model.create).toHaveBeenCalledWith('This is a todo', jasmine.any(Function));

		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () {
			/**
			 * @done Write test
			 * 
			 * We create several todos
			 * We emulate the event 'remove' on a todo
			 * We check if remove method of the model is called with:
			 * - the id of the todo we want to remove
			 * - a callback
			 */
			var todo = {id: 17, title: 'my todo', completed: false };
			var todo2 = {id: 23, title: 'my todo', completed: false };
			var todo3 = {id: 42, title: 'my todo', completed: true };
			const todos = [todo, todo2, todo3];
			setUpModel(todos);

			subject.setView('');
			view.trigger('itemRemove', {id: 23});

			expect(model.remove).toHaveBeenCalledWith(23, jasmine.any(Function));

		});

		it('should remove an entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({ completed: true }, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 21, completed: true });

			expect(model.update).toHaveBeenCalledWith(21, { completed: true }, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 42, completed: false });

			expect(view.render).toHaveBeenCalledWith('elementComplete', { id: 42, completed: false });
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItem', { id: 21, title: 'my todo' });
		});

		it('should leave edit mode on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'new title' });
		});

		it('should persist the changes on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(model.update).toHaveBeenCalledWith(21, { title: 'new title' }, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'my todo' });
		});

		it('should not persist the changes on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
