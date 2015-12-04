Ext.define('NextThought.app.course.overview.components.editing.NewChild', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-newchild',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.add(me.types.map(function(type) {
			return {
				xtype: 'box',
				autoEl: {
					cls: 'new-item ' + type.iconCls,
					cn: [
						{cls: 'icon'},
						{cls: 'title', html: type.title}
					]
				},
				listeners: {
					click: {
						element: 'el',
						fn: function() {
							me.showEditor(type.editor, type.type, me.parentRecord);
						}
					}
				}

			};
		}));
	}
});
