Ext.define('NextThought.overrides.app.Application',{
	override: 'Ext.app.Application',

	registerInitializeTask: function(task) {
		this.initTasks = this.initTasks || [];
		this.initTasks.push(task);
	},

	finishInitializeTask: function(task){
		Ext.Array.remove(this.initTasks,task);
		if(!this.initTasks.length) {
			this.registerInitializeTask = this.finishInitializeTask = Ext.emptyFn;
			this.fireEvent('finished-loading');
		}
	}
});
