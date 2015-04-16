/**
 * Renders a piece of content
 *
 * config {
 *		contentId: the ntiid of the content calls Service.getPageInfo on it
 *  	pageSource: what to fill in the next and previous arrows with
 *   	path: the breadcrumb to show where you are
 *    	assignmentHistory(optional): if rendering an assignment and you already have the history item
 * }
 *
 *
 */
Ext.define('NextThought.view.contentviewer.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-viewer',

	cls: 'content-viewer',

	floating: true,

	requires: [
		// 'NextThought.view.contentviewer.Readers',
		// 'NextThought.view.contentviewer.Annotations',
		// 'NextThought.view.contentviewer.Header'
		'NextThought.view.reader.Panel'
	],

	layout: 'none',


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		this.resolvePageInfo()
			.then(function(pageInfo) {
				me.add({
					xtype: 'reader',
					height: '100%',
					width: '100%',
					pageInfo: pageInfo,
					prefix: guidGenerator()
				});
			});
	},


	resolvePageInfo: function() {
		var ntiid = this.contentId;

		if (!ntiid) {
			return Promise.reject();
		}

		if (ParseUtils.isNTIID(ntiid)) {
			return Service.getPageInfo(ntiid);
		}

		console.error('Dont know how to handle that content id yet:', ntiid);
		return Promise.reject();
	}
});
