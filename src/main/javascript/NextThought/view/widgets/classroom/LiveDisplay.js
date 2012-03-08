Ext.define('NextThought.view.widgets.classroom.LiveDisplay', {
	extend:'Ext.tab.Panel',
	alias: 'widget.live-display',
	requires: [
		'NextThought.view.content.Reader'
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

//		this.content = this.add({
//			xtype: 'shim',
//			layout: 'fit',
//			tabConfig:{
//				title: 'Content',
//				content: true,
//				tooltip: 'Live Content'
//			},
//			//dockedItems: {dock:'bottom', xtype: 'breadcrumbbar', skipHistory: true},
//			item:{
//				xtype: 'reader-panel'
//			}
//		});

		this.whiteboard = this.add({tabConfig:{title:'Whiteboard', tooltip: 'Live Whiteboard'}});
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
