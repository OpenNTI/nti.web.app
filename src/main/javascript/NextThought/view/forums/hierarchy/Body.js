Ext.define('NextThought.view.forums.hierarchy.Body', {
	extend: 'Ext.container.Container',
	widget: 'widget.forums-hierarchy-body',

	cls: 'forums-body',

	layout: 'none',

	setCurrent: function() {},

	allowSelectionChange: function() {
		return true;
	}
});
