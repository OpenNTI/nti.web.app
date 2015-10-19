Ext.define('NextThought.mixins.UIHelpers', {
	fillElementToBottom: function(el) {
		var top = el.getBoundingClientRect().top,
			style = 'calc(100vh - {top}px)';

		el.style.minHeight = style.replace('{top}', top + 20);
	}
});
