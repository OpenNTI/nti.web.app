export default Ext.define('NextThought.overrides.EventManager', function() {

	var EM = Ext.EventManager,
		normalizeEventExt = EM.normalizeEvent;

	function makeSafe(fn) {
		return function() {
			try {
				return fn.apply(this, arguments);
			} catch (e) {
				console.warn(e.stack || e.message || e);
				return null;
			}
		};
	}

	Ext.apply(EM, {
		xnormalizeEvent: function(eventName, fn) {
			if (arguments.length > 2) {
				console.error('i didnt account for this');
			}
			var nomEventName = eventName;
			if (eventName === 'animationend') {
				nomEventName = Ext.supports.CSS3TransitionEnd.replace(/transitionend/, eventName);
				console.debug('listinging on animationEnd', eventName);
			}

			return normalizeEventExt.call(this, [nomEventName, fn]);
		},

		getEventCache: makeSafe(EM.getEventCache),
		getEventListenerCache: makeSafe(EM.getEventListenerCache),
		handleSingleEvent: makeSafe(EM.handleSingleEvent)
	});

	return {};
});
