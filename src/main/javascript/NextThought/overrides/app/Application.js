Ext.define('NextThought.overrides.app.Application',{
	override: 'Ext.app.Application',
	requires: ['NextThought.overrides.app.EventBus'],

	registerInitializeTask: function(task) {
		var method = this.registerInitializeTask.caller;
		method = method.$previous || (method.$owner ? method : method.caller);
		method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;

		if(!task){
			console.error(method+' called registerInitializeTask without a token');
			return;
		}

		this.initTasks = this.initTasks || [];

		this.initTasks.push(task);
		task.timerId = setTimeout(function(){
			console.log('Abandoned init task from: '+ method);
		},30000);
	},

	finishInitializeTask: function(task){
		var method = this.finishInitializeTask.caller;
		method = method.$previous || (method.$owner ? method : method.caller);
		method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;

		if(!task){
			console.error(method+' called finishInitializeTask without a token');
			return;
		}
		clearTimeout(task.timerId);
		Ext.Array.remove(this.initTasks,task);
		if(!this.initTasks.length) {
			this.registerInitializeTask = this.finishInitializeTask = Ext.emptyFn;
			this.fireEvent('finished-loading');
		}
	},


	onBeforeLaunch: function(){
		this.eventbus.injectHooks();
		return this.callParent(arguments);
	}
});
