var Ext = require('extjs');


/**
 * A utility that allows you to schedule tasks to be ran sequentially, if a task returns a promise
 * it will wait for it to finish before executing the next.
 */
module.exports = exports = Ext.define('NextThought.util.BatchExecution', {
	/**
	 * Create a BatchExecution instance
	 * config properties:
	 *
	 * batchSize: Number, //how many to run at once, default 5
	 *
	 * @param  {Object} config - config object
	 * @returns {void}
	 */
	constructor: function (config) {
		this.batchSize = (config && config.batchSize) || 5;

		this.TASKS = [];
	},

	/**
	 * Schedule a function to be executed after all preceding functions in the queue.
	 * If the function returns a Promise, the next execution will wait for it to finish
	 *
	 * @param  {Function} fn task to run
	 * @return {Promise}	 fulfills with the return value of the task
	 */
	schedule: function (fn) {
		var me = this;

		return new Promise(function (fulfill/*, reject*/) {
			me.__queue(function () {
				var resp = fn.call();

				//if the resp is a Promise, a rejection will cause the execution to stop
				//so catch failed promises.
				if (resp instanceof Promise) {
					resp = resp.then(function (val) {
						fulfill(val);
					}).catch(function (reason) {
						console.warn('Batch Execution failed: ', reason);
					});
				} else {
					fulfill(resp);
				}

				return resp;
			});
		});
	},


	__queue: function (fn) {
		this.TASKS.push(fn);

		if (!this.running) {
			this.startExecution();
		}
	},


	__executeBatch: function () {
		//if we were stopped, don't execute the next batch
		if (!this.running) { return; }

		var batch = this.TASKS.splice(0, this.batchSize);

		//if the batch is empty, there's nothing left to do so stop
		if (!batch.length) {
			this.stopExecution();
			return;
		}

		batch = batch.map(function (item) {
			return item.call();
		});

		Promise.all(batch)
			.always(this.__executeBatch.bind(this));
	},


	startExecution: function () {
		this.running = true;

		this.__executeBatch();
	},


	stopExecution: function () {
		this.running = false;
	}
});
