var Ext = require('extjs');
var MenusLabeledSeparator = require('../../../../../common/menus/LabeledSeparator');
var AssessmentAssignmentStatus = require('../../AssignmentStatus');
var EmailWindow = require('./email/Window');
var ComponentsAssignmentStatus = require('../AssignmentStatus');
var ModelEmail = require('../../../../../model/Email');
var WindowsStateStore = require('../../../../windows/StateStore');
var {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.ListHeader', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-listheader',

	statics: {
		setPageSize: function (size) {
			var instances = Ext.ComponentQuery.query(this.xtype) || [];

			instances.forEach(function (instance) {
				instance.setPageSize(parseInt(size, 10));
			});
		}
	},

	cls: 'admin-list-header',
	PAGE_SIZES: [50, 75, 100],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header-container', cn: [
			{cls: 'assignment', cn: [
				{cls: 'title', html: '{assignmentTitle}'},
				{cls: 'extras meta', cn: [
					{tag: 'span', cls: 'link raw', html: '{{{NextThought.view.courseware.assessment.admin.ListHeader.rawAssignment}}}'},
					{tag: 'span', cls: 'link edit', html: 'Edit Assignment'}
				]},
				{cls: 'meta', cn: [
					{tag: 'span', cls: 'due link', html: ''},
					{tag: 'span', cls: 'filter link arrow', html: ''}
				]}
			]},
			{cls: 'controls', cn: [
				{tag: 'a', cls: 'request email', 'data-qtip': 'Email Enrolled Students'},
				{tag: 'a', cls: 'export'},
				{tag: 'a', cls: 'settings'}
			]},
			{cls: 'page', cn: [
				{cls: 'viewing', cn: [
					{cls: 'count', cn: [
						{tag: 'span', cls: 'startIndex', html: '{startIndex}'},
						' - ',
						{tag: 'span', cls: 'endIndex', html: '{endIndex}'},
						' of ',
						{tag: 'span', cls: 'total', html: '{total}'}
					]},
					{cls: 'empty', cn: [
						'0 of 0'
					]}
				]}
			]},
			{cls: 'editor-container'}
		]}
	]),

	renderSelectors: {
		assignmentEl: '.assignment',
		assignmentTitleEl: '.assignment .title',
		assignmentDueEl: '.assignment .due',
		editorContainer: '.editor-container',
		filterEl: '.assignment .filter',
		exportEl: '.controls .export',
		settingsEl: '.controls .settings',
		emailEl: '.controls .email',
		viewingEl: '.page .viewing',
		startIndexEl: '.page .viewing .startIndex',
		endIndexEl: '.page .viewing .endIndex',
		totalEl: '.page .viewing .total',
		viewAssignmentEl: '.assignment .raw',
		editAssignmentEl: '.assignment .edit'
	},


	afterRender: function () {
		this.callParent(arguments);

		this.onStoreLoad();

		this.setExportURL(this.exportURL, this.exportTip);
		this.setAssignment(this.assignment);
		this.updateFilterCount(this.filter);

		this.mon(this.settingsEl, 'click', 'showSettingsMenu');
		this.mon(this.viewingEl, 'click', 'showPageMenu');
		this.mon(this.filterEl, 'click', this.fireEvent.bind(this, 'showFilters', this.filterEl));
		this.mon(this.viewAssignmentEl, 'click', this.fireEvent.bind(this, 'goToRawAssignment'));
		this.mon(this.assignmentDueEl, 'click', this.toggleDateEditor.bind(this));
		this.emailEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		if (this.shouldAllowInstructorEmail() && this.currentBundle && this.currentBundle.getLink('Mail')) {
			this.mon(this.emailEl, 'click', 'showEmailEditor');
		}
		else {
			this.emailEl.hide();
		}

		this.editAssignmentEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		if (this.assignment && this.assignment.getLink('edit')) {
			this.mon(this.editAssignmentEl, 'click', () => this.editAssignment());
		} else {
			this.editAssignmentEl.hide();
		}

		this.WindowActions = NextThought.app.windows.Actions.create();
		this.WindowStore = NextThought.app.windows.StateStore.getInstance();
		wait(10).then(this.onStudentFilterChange.bind(this));
	},


	setDisabled: function () {
		this.addCls('disabled');
	},


	setEnabled: function () {
		this.removeCls('disabled');
	},


	buildPageMenu: function () {
		if (!this.store || !this.rendered) { return; }

		var items = [], i, start, end,
			totalCount = this.store.getTotalCount(),
			totalPages = this.store.getTotalPages(),
			pageSize = this.store.pageSize,
			currentPage = this.store.getCurrentPage();

		Ext.destroy(this.pageMenu);

		//if there are not pages
		if (!totalPages) {
			this.viewingEl.addCls('empty');
		} else {
			this.viewingEl.removeCls('empty');
		}

		for (i = 1; i <= totalPages; i++) {
			start = ((i - 1) * pageSize) + 1;
			end = start + pageSize - 1;

			if (end > totalCount) {
				end = totalCount;
			}

			if (currentPage === i) {
				this.startIndexEl.update(start);
				this.endIndexEl.update(end);
				this.totalEl.update(totalCount);
			}

			items.push({
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				height: 30,
				plain: true,
				group: 'currentPage' + this.id,
				text: start + ' - ' + end + ' (' + totalCount + ')',
				page: i,
				checked: currentPage === i,
				listeners: {
					scope: this,
					'checkchange': 'changePage'
				}
			});
		}

		this.pageMenu = Ext.widget('menu', {
			ownerCmp: this,
			width: this.assignment ? 150 : 200,
			items: items,
			cls: 'pager-settings page'
		});
	},


	buildSettingsMenu: function () {
		if (!this.store) { return; }

		var me = this,
			pageSize = me.store.pageSize,
			items = [];

		if (me.settingsMenu) {
			Ext.destroy(me.settingsMenu);
		}

		items.push({xtype: 'labeledseparator', text: 'display', cls: 'labeled-separator'});

		me.PAGE_SIZES.forEach(function (size) {
			items.push({
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				height: 30,
				plain: true,
				group: 'pageSize' + me.id,
				text: size + ' Students per page',
				size: size,
				checked: size === pageSize,
				listeners: {
					scope: me,
					'checkchange': 'changePageSize'
				}
			});
		});


		items.push({xtype: 'menuseparator'});

		items.push({
			xtype: 'menucheckitem',
			height: 30,
			plain: true,
			cls: 'avatar-toggle',
			text: 'Hide Avatars',
			checked: !this.showAvatars,
			listeners: {
				scope: me,
				'checkchange': 'toggleAvatars'
			}
		});

		me.settingsMenu = Ext.widget('menu', {
			ownerCmp: me,
			width: 200,
			items: items,
			cls: 'pager-settings'
		});

		me.settingsMenu.show().hide();
	},


	onStudentFilterChange: function (filter) {
		var q;

		if (!filter) {
			filter = this.ownerCt && this.ownerCt.studentFilter;
		}

		if (filter === 'ForCredit') {
			q = getString('NextThought.view.courseware.assessment.admin.performance.Root.emailenrolled');
		}
		else if (filter === 'Open') {
			q = getString('NextThought.view.courseware.assessment.admin.performance.Root.emailopen');
		}
		else if (filter === 'All') {
			q = getString('NextThought.view.courseware.assessment.admin.performance.Root.emailall');
		}

		if (this.emailEl && q) {
			this.emailEl.dom.setAttribute('data-qtip', q);
			this.maybeShowEmailButton(filter);
		}
	},


	maybeShowEmailButton: function (filter) {
		var isAllowed = this.shouldAllowInstructorEmail() && this.currentBundle && this.currentBundle.getLink('Mail');
		if (isAllowed && this.emailEl) {
			this.emailEl.show();
		}
	},


	shouldAllowInstructorEmail: function () {
		return isFeature('instructor-email');
	},


	showEmailEditor: function (e) {
		var me = this,
			editor,
			emailRecord = new NextThought.model.Email(),
			scope = this.ownerCt && this.ownerCt.studentFilter;

		// Set the link to post the email to
		emailRecord.set('url', this.currentBundle && this.currentBundle.getLink('Mail'));
		emailRecord.set('scope', scope);

		// Cache the email record
		this.WindowStore.cacheObject('new-email', emailRecord);

		this.WindowActions.showWindow('new-email', null, e.getTarget(), {afterSave: this.onCourseEmailSent.bind(this)});
	},


	onCourseEmailSent: function () {},


	showSettingsMenu: function () {
		if (!this.settingsMenu) { return; }

		this.settingsMenu.showBy(this.settingsEl, 'tr-br');
	},


	showPageMenu: function (e) {
		if (!this.pageMenu || e.getTarget('.empty')) { return; }

		this.pageMenu.showBy(this.viewingEl, 'tr-br');
	},


	changePage: function (item, status) {
		if (!status || !this.store) { return; }


		var page = item.page || 1;
		this.fireEvent('page-change');
		this.loadPage(page);
	},


	changePageSize: function (item, status) {
		if (!status || !this.store) { return; }

		var size = item.size;

		this.setPageSize(size);
	},


	setPageSize: function (size) {
		this.pageSize = size;

		this.fireEvent('set-page-size', this.pageSize);
	},


	toggleAvatars: function (item, status) {
		this.fireEvent('toggle-avatars', !status);
	},


	bindStore: function (store) {
		this.store = store;

		this.mon(store, 'load', 'onStoreLoad');
		this.onStoreLoad();
		this.buildSettingsMenu();
	},


	onStoreLoad: function () {
		if (!this.store || !this.rendered) { return; }

		this.buildPageMenu();
		this.buildSettingsMenu();
	},


	setExportURL: function (url, tip) {
		this.exportURL = url;
		this.exportTip = tip;

		if (!this.rendered) {
			return;
		}

		if (!url) {
			this.exportEl.addCls('hidden');
		} else {
			this.exportEl.removeCls('hidden');
			this.exportEl.dom.setAttribute('href', url);
			this.exportEl.dom.setAttribute('data-qtip', tip);
		}
	},


	setAvatarToggle: function (show) {
		this.showAvatars = show;

		this.buildSettingsMenu();

		this.toggleAvatars(null, !show);
	},


	setAssignment: function (assignment) {
		if (!this.rendered) {
			this.assignment = assignment;
			return;
		}

		var exportLink,
			due;

		if (!assignment) {
			this.assignmentEl.addCls('hidden');
			return;
		}

		this.assignmentEl.removeCls('hidden');

		exportLink = assignment.getLink('ExportFiles');

		if (exportLink) {
			this.setExportURL(exportLink, getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.download'));
		}

		this.assignmentTitleEl.update(assignment.get('title'));
		this.assignmentTitleEl.dom.setAttribute('data-qtip', assignment.get('title'));

		this.assignmentDueEl.update(NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
			due: assignment.getDueDate(),
			maxTime: assignment.isTimed && assignment.getMaxTime(),
			duration: assignment.isTimed && assignment.getDuration(),
			isNoSubmitAssignment: assignment.isNoSubmit()
		}));

		if (assignment.getLink('edit')) {
			this.assignmentDueEl.addCls('arrow');
		} else {
			this.assignmentDueEl.removeCls('arrow');
		}

		this.assignmentStatusCmp = new NextThought.app.course.assessment.components.AssignmentStatus({
			assignment: assignment,
			renderTo: this.editorContainer
		});

		this.on('destroy', this.assignmentStatusCmp.destroy.bind(this.assignmentStatusCmp));
	},


	toggleDateEditor: function () {
		if (this.assignmentStatusCmp && this.assignmentStatusCmp.dueDateEditorVisible()) {
			this.assignmentStatusCmp.closeDueDateEditor();
		} else if (this.assignmentStatusCmp) {
			this.assignmentStatusCmp.showDueDateEditor();
		}
	},


	updateFilterCount: function (filter) {
		if (!this.rendered) {
			this.filter = filter;
			return;
		}

		if (!filter) {
			this.filterEl.update('');
		} else {
			this.filterEl.update(filter);
		}
	},


	loadPage: function (page) {
		this.currentPage = page;

		this.fireEvent('load-page', this.currentPage);
	},


	editAssignment () {
		this.fireEvent('editAssignment');
	}
});
