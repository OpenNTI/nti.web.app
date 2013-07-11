Ext.define('NextThought.view.course.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.course',

	layout: 'border',
	defaults: {
		xtype: 'container',
		border: false,
		plain: true
	},
	items: [
		{ region: 'west', width: 255, margin: '0 5 5 0', cls:'make-white' },
		{ region: 'center', cls:'make-white' }
	]
});
