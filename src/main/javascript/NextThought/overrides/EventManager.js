Ext.define('NextThought.overrides.EventManager', function() {

	var normalizeEventExt = Ext.EventManager.normalizeEvent;

	Ext.EventManager.xnormalizeEvent = function(eventName, fn) {
		if (arguments.length > 2) {
			console.error('i didnt account for this');
		}
		var nomEventName = eventName;
		if (eventName === 'animationend') {
			nomEventName = Ext.supports.CSS3TransitionEnd.replace(/transitionend/, eventName);
			console.debug('listinging on animationEnd', eventName);
		}

		return normalizeEventExt.call(this, [nomEventName, fn]);
	};

	return {};
});
