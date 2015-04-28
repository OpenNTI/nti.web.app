Ext.define('NextThought.util.AsynchronousUtils', {});

function FinishCallback(callback, scope) {
	this.callback = callback;
	this.scope = scope;
	this.counter = 0;

	this.newTask = function() {
		this.counter++;

		var me = this;

		return function() {
			me.counter--;

			if (me.counter <= 0) {
				me.finish();
			}
		};
	};

	this.finish = function() {
		Ext.callback(this.callback, this.scope);
	};

	this.maybeFinish = function() {
		this.newTask().call(this);
	};
}
