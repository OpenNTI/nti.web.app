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

		this._content = this.add({
			layout: 'fit',
			tabConfig:{title: 'Content', content:true, tooltip: 'Live Content'},
			dockedItems: {dock:'bottom', xtype: 'breadcrumbbar', skipHistory: true}
		});

		this._whiteboard = this.add({tabConfig:{title:'Whiteboard', tooltip: 'Live Whiteboard'}});
	},

	getReaderPanel: function() {
		return Ext.getCmp('readerPanel');
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
		c.setActive(true);
		this.setActiveTab(c);
	},


	destroy: function() {
		//remove reader so it is not destroyed
		this._content.remove(this.getReaderPanel(), false);

		//do this last
		this.callParent(arguments);
	}
});
