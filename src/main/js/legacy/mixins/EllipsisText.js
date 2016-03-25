var Ext = require('extjs');


/**
* Use this mixin to truncate text and add ellipsis depending on its parent node or itself
*/
module.exports = exports = Ext.define('NextThought.mixins.EllipsisText', {

	/**
	 * Goal: Group dom reads/writes into single passes.
	 */
	statics: {
		TASKS: [],

		schedule: function (fn) {
			var task = this.addTask(fn);

			this.start();

			return task;
		},


		isInterrupted: function (task) {
			return task.skip || (task.parent && this.isInterrupted(task.parent));
		},


		getTasks: function () {
			var me = this;

			//filter out tasks that have already run or have been interrupted
			return (me.TASKS || []).filter(function (x) {
				return !me.isInterrupted(x) && !x.run;
			});
		},


		addTask: function (task) {
			var tasks = this.getTasks();

			task = {
				fn: task
			};

			tasks.push(task);

			this.TASKS = tasks;

			return task;
		},


		start: function () {
			var me = this;

			if (!me.timeout) {
				me.timeout = setTimeout(function () {
					me.stop();
					me.run();
				}, 1);
			}
		},


		stop: function () {
			if (this.timeout) {
				clearTimeout(this.timeout);
				delete this.timeout;
			}
		},


		run: function () {
			var tasks = this.getTasks();

			(tasks || []).forEach(function (task) {
				var child;

				try {
					child = task.fn.call();

					if (child) {
						child.parent = task;
					}
				} catch (e) {
					console.error(e);
				}

				task.run = true;
			});

			//Reset the list to filter out the tasks that have already ran
			this.TASKS = this.getTasks();
		}
	},

	/**
	* @param: {Node} node - HTML element that we would like to ellipsis or expand into multiple lines
	* @param: {String} measure - the box that we should use as reference. Defaults to self node.
	* NOTE: the box should have a max-height property set on it.
	*/
	truncateText: function (node, measure, noEllipse) {
		var box = node,
			textProperty = node.textContent !== null ? 'textContent' : 'innerText',
			setToolTipOnce;

		if (measure === 'parent') {
			box = node.parentNode;
		}

		setToolTipOnce = function () {
			node.setAttribute('data-qtip', node[textProperty]);
			setToolTipOnce = function () {};
		};

		if (noEllipse) {
			setToolTipOnce = function () {};
		}

		function work () {
			// NOTE: because of line-height, in different browsers, we might have a slight difference
			// between the box's scrollHeight and its offsetHeight. And since no line should be 5px tall, check against 5.
			if (box.scrollHeight - (box.clientHeight || box.offsetHeight) >= 5) {
				if (node[textProperty] !== '...') {
					setTipOnce();
				}
			}
		}

		NextThought.mixins.EllipsisText.schedule(function () {
			var box = node;

			if (measure === 'parent') {
				box = node.parentNode;
			}

			function work () {
				// NOTE: because of line-height, in different browsers, we might have a slight difference
				// between the box's scrollHeight and its offsetHeight. And since no line should be 5px tall, check against 5.
				if (box.scrollHeight - (box.clientHeight || box.offsetHeight) >= 5) {
					if (node[textProperty] !== '...') {
						setToolTipOnce();
						node[textProperty] = node[textProperty].replace(/.(\.+)?$/, '...');
						return NextThought.mixins.EllipsisText.schedule(work);
					}
				}
			}

			return work();
		});
	}

});
