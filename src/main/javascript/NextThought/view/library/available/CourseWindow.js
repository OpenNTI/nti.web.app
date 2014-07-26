Ext.define('NextThought.view.library.available.CourseWindow', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.library-available-courses-window',

	requires: [
		'NextThought.view.courseware.coursecatalog.Collection',
		'NextThought.view.courseware.coursecatalog.TabPanel'
	],

	floating: true,

	label: 'Add Courses',

	constrainTo: Ext.getBody(),
	width: 1024,
	height: '85%',
	dialog: true,
	header: false,
	componentLayout: 'natural',
	layout: 'card',

	cls: 'available-courses',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],
	getDockedItems: function() { return []; },
	center: Ext.emptyFn,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'name', html: '{label}'},
			{cls: 'close'}
		]},
		{cls: 'msg-container', cn: [
			{cls: 'msg'},
			{cls: 'close-msg'}
		]},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'footer', cn: [
			{cls: 'done button close', html: 'Finished'}
		]}
	]),


	renderSelectors: {
		labelEl: '.header .name',
		msgContainerEl: '.msg-container',
		msgEl: '.msg-container .msg',
		bodyEl: '.body-container'
	},


	initComponent: function() {
		this.callParent(arguments);

		if (this.showAvailable) {
			this.showTabpanel();
		}

		if (this.course) {
			this.showCourse(this.course);
		}
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'click', function(e) {
			if (e.getTarget('.close')) {
				me.close();
			}

			if (e.getTarget('.back')) {
				me.showPrevItem();
			}
		});

		me.on('show-msg', 'showMsg');
	},

	showPrevItem: function() {
		var current = this.getLayout().getActiveItem();

		if (!current.fireEvent('beforedeactivate')) {
			return;
		}

		if (current.is('course-enrollment-details')) {
			this.showTabpanel();
		}
	},

	/**
	 * show the message bar across the top of the window
	 * @param  {string}  msg             the message to display
	 * @param  {Boolean} isError         whether or not we are showing an error
	 * @param  {Boolean} hasClickHandler if there is a function to handle the click
	 * @return {Promise}                  fulfill if there is a click handler on click, and reject on close
	 */
	showMsg: function(msg, isError, hasClickHandler) {
		var me = this;

		me.msgContainerEl[isError ? 'addCls' : 'removeCls']('error');
		me.msgEl.update(msg);

		me.bodyEl.addCls('has-msg');
		me.msgContainerEl.addCls('show');

		return new Promise(function(fulfill, reject) {
			me.msgMonitors = me.mon(me.msgContainerEl, {
				'single': true,
				'click': function(e) {
					if (e.getTarget('.close-msg')) {
						me.bodyEl.removeCls('has-msg');
						me.msgContainerEl.removeCls('show');
						reject();
						return;
					}

					if (hasClickHandler) {
						fulfill();
					}
				}
			});
		});
	},


	showTabpanel: function() {
		if (!this.showAvailable) { return; }

		var me = this;

		if (!this.tabpanel) {
			this.tabpanel = this.add({
				xtype: 'course-catalog-tabpanel',
				upcoming: this.upcoming,
				current: this.current,
				archived: this.archived
			});

			this.mon(this.tabpanel, 'show-course-detail', 'showCourse');
		}

		function updateLabel() {
			me.labelEl.removeCls('back');
			me.labelEl.update(me.label);
		}


		if (!this.rendered) {
			this.on('afterrender', updateLabel);
		} else {
			updateLabel();
		}

		this.getLayout().setActiveItem(this.tabpanel);
	},


	showCourse: function(course) {
		var me = this;

		me.courseDetail = me.add({
			xtype: 'course-enrollment-details',
			course: course
		});


		function updateLabel() {
			if (me.showAvailable) {
				me.labelEl.addCls('back');
				activeTab = me.tabpanel.getActiveTab();

				me.labelEl.update(activeTab.title + ' Courses');
			} else {
				me.labelEl.update(course.get('Title'));
			}
		}

		if (!me.rendered) {
			me.on('afterrender', updateLabel);
		} else {
			updateLabel();
		}

		me.getLayout().setActiveItem(me.courseDetail);
	}
});
