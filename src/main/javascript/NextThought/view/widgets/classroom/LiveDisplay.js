Ext.define('NextThought.view.widgets.classroom.LiveDisplay', {
	extend:'Ext.tab.Panel',
	alias: 'widget.live-display',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.widgets.ClassroomBreadcrumb'
	],
	cls: 'nti-live-display',
	tabPosition: 'bottom',
	border: false,
	defaults: {
		border: false,
		defaults: {
			border: false
		}
	},

	initComponent: function()
	{
		this.callParent(arguments);

		var prefix = guidGenerator();
		this.content = this.add({
			xtype: 'reader-panel',
			tracker: false,
			prefix: prefix,
			tabConfig:{
				title: 'Content',
				content: true,
				tooltip: 'Live Content'
			},
			dockedItems: {dock:'bottom', xtype: 'classroom-breadcrumbbar', prefix: prefix, skipHistory: true}
		});
	},

	getReaderPanel: function() {
		throw 'Fix me';
	},


	addContent: function(href) {
		var c = this.down('image');

		//If no content tab, create one
		if (!c) {
			c = this.add(
				{
					xtype: 'image',
					src: href,
					tabConfig: {
						title: 'Image'
					}
				}
			);
		}
		else {
			c.setSrc(href);
		}

		this.setActiveTab(c);
	}
});
