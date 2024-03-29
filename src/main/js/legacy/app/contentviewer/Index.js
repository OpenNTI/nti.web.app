const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const { isMe } = require('internal/legacy/util/Globals');
const ContentviewerActions = require('internal/legacy/app/contentviewer/Actions');

require('internal/legacy/mixins/Searchable');
require('./Actions');
require('./panels/Reader');
require('./panels/assignment/Admin');
require('./panels/assignment/Student');

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
 *		pageSource: what to fill in the next and previous arrows with, or a promise that fills in with the page source
 *		path: the breadcrumb to show where you are, or a promise that fulfills with path,
 *		toc: (optional) store to fill in the toc fly out,
 *		next: ???? what to show as the next thing when you are at the bottom of the reader
 *		assignment(optional): the assignment you are rendering
 *		student(optional): if rendering an assignment the student you are rendering for
 *		assignmentHistory(optional): if rendering an assignment and you already have the history item,
 *		navigate: function to call to navigate,
 *		onRoute: function to call when a route is changed,
 *		onClose: function
 * }
 *
 *
 * The path is an array or a promise that fulfills with an array of either:
 *
 * 1.) String: the label to show for this path item,
 * 2.) Object: A config with
 *			{
 *				label: String,
 *				cls: String,
 *				route: String route to navigate to
 *				title: String title of the route
 *				precache: String items to prepopulate the route with
 *				siblings: [ //items to fill out the hover menu
 *					{
 *						label: String,
 *						cls: String,
 *						ntiid: NTIID to navigate to
 *					}
 *				]
 *			}
 *
 */
module.exports = exports = Ext.define('NextThought.app.contentviewer.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-viewer',
	cls: 'content-viewer',

	mixins: {
		Searchable: 'NextThought.mixins.Searchable',
	},

	layout: 'none',

	constructor(config) {
		var readerConfig = {
			xtype: 'reader',
			height: '100%',
			width: '100%',
			path: config.path,
			pageSource: config.pageSource,
			// toc: config.toc,
			showToc: config.showToc,
			contentPackage: config.contentPackage,
			rootId: config.rootId,
			currentPage: config.currentPage,
			bundle: config.bundle,
			handleNavigation: config.handleNavigation,
			navigateToObject: config.navigateToObject,
			doNotAssumeBodyScrollParent: config.doNotAssumeBodyScrollParent,
			contentOnly: config.contentOnly,
			showRemainingTimeOverride: config.showRemainingTime,
			setActiveHistoryItem: config.setActiveHistoryItem,
			beforeSubmit: config.beforeSubmit,
			afterSubmit: config.afterSubmit,
			fragment: config.fragment,
			note: config.note,
			rootRoute: config.rootRoute,
			handleEdit: config.handleEdit,
		};

		if (config.assignment) {
			readerConfig.xtype =
				!config.student || isMe(config.student)
					? 'assignment-reader'
					: 'admin-assignment-reader';
			readerConfig.assignment = config.assignment;
			readerConfig.assignmentHistory = config.assignmentHistory;
			readerConfig.assignmentHistoryItemContainer =
				config.assignmentHistoryItemContainer;
			readerConfig.assignmentId = config.assignment.getId();
			readerConfig.student = config.student;
			readerConfig.instructorProspective = config.instructorProspective;
		}

		config.readerConfig = readerConfig;

		this.callParent(arguments);
	},

	initComponent() {
		this.callParent(arguments);

		var me = this;

		me.ContentViewerActions = ContentviewerActions.create();

		me.resolvePageInfo().then(function (pageInfo) {
			me.resolvedPageInfo = pageInfo;
			me.readerConfig.pageInfo = pageInfo;

			me.readerConfig = me.__fixConfigForPageInfo(
				me.readerConfig,
				pageInfo
			);

			me.reader = me.add(me.readerConfig);
			me.reader.fireEvent('activate');
			me.fireEvent('reader-set');

			me.mon(me.reader, {
				'assignment-submitted': (...args) => {
					me.fireEvent('assignment-submitted', ...args);

					if (me.onAssignmentSubmitted) {
						me.onAssignmentSubmitted(...args);
					}
				},
				'assessment-graded': (...args) => {
					me.fireEvent('assessment-graded', ...args);

					if (me.onAssessmentGraded) {
						me.onAssessmentGraded(...args);
					}
				},
			});

			me.initSearch();
		});

		me.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this),
			beforedestroy: this.onDeactivate.bind(this),
		});
	},

	__fixConfigForPageInfo(config, pageInfo) {
		var assignment = pageInfo.getAssignment();

		if (config.xtype === 'reader' && assignment) {
			config.xtype = 'assignment-reader';
			config.assignment = config.assignment || assignment;
			config.assignmentId = config.assignmentId || assignment.getId();
			config.student = $AppConfig.userObject;
			config.instructorProspective = false;
		}

		return config;
	},

	onActivate() {
		this.initSearch();

		this.reader?.fireEvent('activate');
	},

	onDeactivate() {
		this.reader?.fireEvent('deactivate');
	},

	alignNavigation() {
		this.reader?.alignNavigation();
	},

	getContainerIdForSearch() {
		return this.resolvedPageInfo?.getId();
	},

	async onceReadyForSearch() {
		if (!this.reader)
			await new Promise(fulfill => this.on('reader-set', fulfill));

		return this.reader.onceReadyForSearch();
	},

	async showSearchHit(hit, fragment) {
		this.clearSearchHit();

		await wait();

		this.reader?.showSearchHit(hit, fragment);
	},

	goToFragment(fragment) {
		this.reader?.goToFragment(fragment);
	},

	goToNote(note) {
		this.reader?.goToNote(note);
	},

	showContainerNoteEditor() {
		this.reader?.showContainerNoteEditor();
	},

	resolvePageInfo() {
		var p;

		if (this.pageInfo) {
			p = Promise.resolve(this.pageInfo);
		} else if (this.relatedWork) {
			p = this.ContentViewerActions.getRelatedWorkPageInfo(
				this.relatedWork,
				this.bundle
			);
		} else if (this.assignment) {
			p = this.resolveAssignmentPageInfo(this.assignment, this.bundle);
			// p = Service.getPageInfo(this.assignment.getId(), null, null, null, this.bundle);
		} else if (this.contentId) {
			p = Service.getPageInfo(
				this.contentId,
				null,
				null,
				null,
				this.bundle
			);
		} else if (this.externalToolAsset) {
			p = this.ContentViewerActions.getExternalToolAssetPageInfo(
				this.externalToolAsset,
				this.bundle
			);
		} else if (this.survey) {
			p = this.resolveSurveyPageInfo(this.survey, this.bundle);
		}

		return p;
	},

	resolveAssignmentPageInfo(assignment, bundle) {
		return Service.getPageInfo(
			assignment.getId(),
			null,
			null,
			null,
			this.bundle
		).catch(() => {
			return this.ContentViewerActions.getAssignmentPageInfo(
				assignment,
				bundle,
				this.student
			);
		});
	},

	resolveSurveyPageInfo(survey, bundle) {
		return Service.getPageInfo(
			survey.getId(),
			null,
			null,
			null,
			bundle
		).catch(() => {
			return this.ContentViewerActions.getSurveyPageInfo(survey, bundle);
		});
	},

	allowNavigation() {
		return this.reader ? this.reader.allowNavigation() : true;
	},

	beforeRouteChange() {
		return this.reader && this.reader.beforeRouteChange();
	},

	getLocation() {
		return this.reader.getLocation();
	},

	updateHistory(h, container) {
		var reader = this.reader;

		if (reader && reader.updateHistory) {
			reader.updateHistory(h, container);
		}
	},
});
