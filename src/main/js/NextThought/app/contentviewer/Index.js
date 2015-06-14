/**
 * Renders a piece of content
 *
 * TODO: figure out how we can share the reader with the mobile app, once it has feature parity.
 *
 * config {
 *		contentId: the ntiid of the content calls Service.getPageInfo on it
 *		pageInfo: the page info to render,
 *		relatedWork: the related work ref to show,
 *		bundle: the bundle/content package we are in,
 *  	pageSource: what to fill in the next and previous arrows with, or a promise that fills in with the page source
 *   	path: the breadcrumb to show where you are, or a promise that fulfills with path,
 *   	toc: (optional) store to fill in the toc fly out,
 *   	next: ???? what to show as the next thing when you are at the bottom of the reader
 *   	assignment(optional): the assignment you are rendering
 *   	student(optional): if rendering an assignment the student you are rendering for
 *    	assignmentHistory(optional): if rendering an assignment and you already have the history item,
 *    	navigate: function to call to navigate,
 *    	onRoute: function to call when a route is changed,
 *    	onClose: function
 * }
 *
 *
 * The path is an array or a promise that fulfills with an array of either:
 *
 * 1.) String: the label to show for this path item,
 * 2.) Object: A config with
 * 			{
 * 				label: String,
 * 				cls: String,
 * 				route: String route to navigate to
 * 				title: String title of the route
 * 				precache: String items to prepopulate the route with
 * 				siblings: [ //items to fill out the hover menu
 * 					{
 * 						label: String,
 * 						cls: String,
 * 						ntiid: NTIID to navigate to
 * 					}
 * 				]
 * 			}
 *
 */
Ext.define('NextThought.app.contentviewer.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-viewer',

	cls: 'content-viewer',

	requires: [
		// 'NextThought.view.contentviewer.Readers',
		// 'NextThought.view.contentviewer.Annotations',
		// 'NextThought.view.contentviewer.Header'
		// 'NextThought.view.reader.Panel',
		'NextThought.app.contentviewer.Actions',
		'NextThought.app.contentviewer.panels.*'
	],

	layout: 'none',

	constructor: function(config) {
		var readerConfig = {
			xtype: 'reader',
			height: '100%',
			width: '100%',
			path: config.path,
			pageSource: config.pageSource,
			toc: config.toc,
			bundle: config.bundle,
			handleNavigation: config.handleNavigation,
			navigateToObject: config.navigateToObject
		};

		if (config.assignment) {
			readerConfig.xtype = !config.student || isMe(config.student) ? 'assignment-reader' : 'admin-assignment-reader';
			readerConfig.assignment = config.assignment;
			readerConfig.assignmentHistory = config.assignmentHistory;
			readerConfig.assignmentId = config.assignment.getId();
			readerConfig.student = config.student;
			readerConfig.instructorProspective = config.instructorProspective;
		}


		config.readerConfig = readerConfig;

		this.callParent(arguments);
	},


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.ContentViewerActions = NextThought.app.contentviewer.Actions.create();

		me.resolvePageInfo()
			.then(function(pageInfo) {
				me.readerConfig.pageInfo = pageInfo;

				me.reader = me.add(me.readerConfig);

				me.mon(me.reader, {
					'assignment-submitted': me.fireEvent.bind(me, 'assignment-submitted'),
					'assessment-graded': me.fireEvent.bind(me, 'assessment-graded')
				});
			});
	},


	resolvePageInfo: function() {
		var p;

		if (this.pageInfo) {
			p = Promise.resolve(this.pageInfo);
		} else if (this.relatedWork) {
			p = this.ContentViewerActions.getRelatedWorkPageInfo(this.relatedWork, this.bundle);
		} else if (this.assignment) {
			p = Service.getPageInfo(this.assignment.getId());
		} else if (this.contentId) {
			p = Service.getPageInfo(this.contentId);
		}

		return p;
	},


	allowNavigation: function() {
		return this.reader ? this.reader.allowNavigation() : true;
	}
});
