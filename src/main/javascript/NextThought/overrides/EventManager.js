Ext.define('NextThought.overrides.EventManager',function () {

	var normalizeEventExt = Ext.EventManager.normalizeEvent;

	Ext.EventManager.normalizeEvent = function(eventName, fn) {
		if(arguments.length>2){
			console.error('i didnt account for this');
		}

		if(eventName === 'animationend'){
			eventName = Ext.supports.CSS3TransitionEnd.replace(/transitionend/,eventName);
			console.debug('listinging on animationEnd', eventName);
		}

		return normalizeEventExt.call(this,[eventName,fn]);
	};

	return {}
});
