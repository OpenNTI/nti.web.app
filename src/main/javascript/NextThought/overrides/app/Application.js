Ext.define('NextThought.overrides.app.Application',{
	override: 'Ext.app.Application',



	beginInitializeTask: function(name){
		var token = {name:name},
			me = this,
			method = me.beginInitializeTask.caller;

		method = method.$previous || (method.$owner ? method : method.caller);
		method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;
		token.method = method;
		me.registerInitializeTask(token);
		return function(){
			me.finishInitializeTask(token);
		};
	},


	registerInitializeTask: function(task) {
		var method = this.registerInitializeTask.caller;
		method = method.$previous || (method.$owner ? method : method.caller);
		method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;

		if(!task){
			console.error(method+' called registerInitializeTask without a token');
			return;
		}


		task.method = method = task.method || method;
		task.start = new Date();

		this.initTasks = this.initTasks || [];

		this.initTasks.push(task);
		task.timerId = setTimeout(function(){
			console.debug('Abandoned init task from: '+ method, task.name || task);
			Globals.removeLoaderSplash();
			task.expired = true;
			alert({
				icon:     Ext.Msg.ERROR,
				title:    'Timeout',
				msg:      'There was some issue preventing us from starting',
				closable: false,
				buttons:  null
			});
		},task.timeout||30000);
	},

	finishInitializeTask: function(task){
		var method = this.finishInitializeTask.caller;
		method = method.$previous || (method.$owner ? method : method.caller);
		method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;

		if(!task){
			console.error(method+' called finishInitializeTask without a token');
			return;
		}
		if(task.expired){
			Ext.MessageBox.close();
			console.debug('Recovering init task: '+method+'... took: '+((new Date() - task.start)/1000)+'s');

		}
		clearTimeout(task.timerId);
		Ext.Array.remove(this.initTasks,task);
		if(!this.initTasks.length) {
			this.registerInitializeTask = this.finishInitializeTask = Ext.emptyFn;
			this.fireEvent('finished-loading');
		}
	}
});
