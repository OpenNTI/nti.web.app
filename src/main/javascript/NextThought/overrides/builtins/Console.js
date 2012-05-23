Ext.define('NextThought.overrides.builtins.Console',{

},function(){
	Ext.applyIf(window,{
		console:{ log: Ext.emptyFn }
	});

	Ext.applyIf(window.console,{
		debug: console.log,
		info: console.log,
		warn: console.log,
		error: console.log,
		group: Ext.emptyFn,
		trace: Ext.emptyFn,
		groupCollapsed: Ext.emptyFn,
		groupEnd: Ext.emptyFn,
		time: Ext.emptyFn,
		timeEnd: Ext.emptyFn
	});
});
