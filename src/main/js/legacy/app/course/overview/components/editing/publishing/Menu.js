const Ext = require('extjs');

require('../../../../../../common/form/fields/DatePicker');
require('../Actions');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.publishing.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-publishing-menu',
	MAX_HEIGHT: 550,
	cls: 'editing-publishing-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'arrow'},
		{cls: 'container', cn: [
			{cls: 'option publish', 'data-action': 'publish', cn: [
				{cls: 'text', html: 'Publish Now'},
				{cls: 'subtext', html: 'Lesson contents are visible to students.'}
			]},
			{cls: 'option publish-on-date', 'data-action': 'publish-date', cn: [
				{cls: 'text', html: 'Schedule'},
				{cls: 'subtext', cn: [
					{tag: 'span', cls: 'description', html: 'When do you want students to have access to this lesson?'},
					{cls: 'date-picker-container'}
				]}
			]},
			{cls: 'option unpublish selected', 'data-action': 'unpublish', cn: [
				{cls: 'text', html: 'Draft'},
				{cls: 'subtext', html: 'Currently not visible to any students'}
			]},
			{cls: 'save disabled', html: 'Save'}
		]}
	]),

	renderSelectors: {
		containerEl: '.container',
		publishEl: '.publish',
		publishOnDateEl: '.publish-on-date',
		unpublishEl: '.unpublish',
		saveBtnEl: '.save'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();

		this.realign = this.realign.bind(this);

		this.onWindowResizeBuffer = Ext.Function.createBuffered(this.realign, 10, this);

		this.on('destroy', this.close.bind(this));
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.publishEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.publishOnDateEl, 'click', this.onPublishOnDateClick.bind(this));
		this.mon(this.unpublishEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.saveBtnEl, 'click', this.onSave.bind(this));
	},

	open: function () {
		Ext.EventManager.onWindowResize(this.onWindowResizeBuffer, this);
		window.addEventListener('scroll', this.realign);
		this.setInitialState();
		this.realign(true);
	},

	close: function () {
		Ext.EventManager.removeResizeListener(this.onWindowResizeBuffer, this);
		window.removeEventListener('scroll', this.realign);
	},

	alignTo: function (domNode) {
		this.alignedTo = domNode;

		this.realign();
	},

	realign: function (unlockSide) {
		if (!this.alignedTo || !this.rendered) { return; }

		var menu = this.el,
			container = this.containerEl,
			menuHeight = this.el.dom.clientHeight,
			maxMenuHeight = this.MAX_HEIGHT,
			body = Ext.getBody(),
			bodyRect = body && body.el && body.el.dom && body.el.dom.getBoundingClientRect(),
			bodyHeight = body.getHeight(),
			button = this.alignedTo,
			buttonRect = button && button.getBoundingClientRect(),
			buttonRelativeTop = buttonRect.top - bodyRect.top,
			buttonRelativeBottom = buttonRelativeTop + buttonRect.height,
			// viewHeight = Ext.Element.getViewportHeight(),
			viewWidth = Ext.Element.getViewportWidth(),
			positions = {
				below: {
					cls: 'below',
					top: buttonRect.bottom + 12,
					maxHeight: bodyHeight - buttonRelativeBottom - 12,
					right: viewWidth - buttonRect.right - 10
				},
				above: {
					cls: 'above',
					top: buttonRect.top - menuHeight - 12,
					maxHeight: buttonRelativeTop - 12,
					right: viewWidth - buttonRect.right - 10
				}
			};

		function applyPositioning (position) {
			if (menu) {
				menu.removeCls(['below', 'above']);
				menu.addCls(position.cls);
				menu.setStyle({
					top: position.top + 'px',
					right: position.right + 'px',
					maxHeight: position.maxHeight + 'px'
				});
			}

			if (container) {
				container.setStyle('maxHeight', position.maxHeight + 'px');
			}
		}

		if (menuHeight === 0) { return; }

		if (this.lockedToSide && unlockSide !== true) {
			applyPositioning(positions[this.lockedToSide]);
		} else if (positions.below.maxHeight >= maxMenuHeight || positions.below.maxHeight >= positions.above.maxHeight) {
			this.lockedToSide = 'below';
			applyPositioning(positions.below);
		} else {
			this.lockedToSide = 'above';
			applyPositioning(positions.above);
		}
	},

	setInitialState: function () {
		var node = this.record,
			isNodePublished = node && node.isPublished && node.isPublished(),
			lesson = this.contents,
			isLessonPublished = lesson && lesson.isPublished && lesson.isPublished(),
			lessonPublishDate = lesson && lesson.get('publishBeginning'),
			hasPublishDatePassed = lesson && lesson.hasPublishDatePassed && lesson.hasPublishDatePassed(),
			date;

		// TODO: Needs simplification, once the server fixes the publicationState issue.
		// The first case should check if both the outlinenode and the lesson are published or
		// if the lesson node has a publish on date, that has already passed.
		if (isNodePublished && ((isLessonPublished && !lessonPublishDate) || hasPublishDatePassed)) {
			this.select(this.publishEl);
			this.initialState = this.publishEl;
		}
		else if (!isNodePublished && !isLessonPublished) {
			this.select(this.unpublishEl);
			this.initialState = this.unpublishEl;
		}
		else if (isNodePublished && lessonPublishDate) {
			date = lesson && lesson.get('publishBeginning');
			if (date) {
				date = new Date(date);
				this.setPublishOnDateText(date);
			}

			this.select(this.publishOnDateEl);
			this.initialState = this.publishOnDateEl;
			this.createDatePicker(this.publishOnDateEl.down('.date-picker-container'));
		}
		else {
			this.select(this.unpublishEl);
			this.initialState = this.unpublishEl;
		}

		// Make sure we set the default date properly.
		// In the case where we have a publish date and it has passed, set it to the default value.
		if (this.datepicker && (!lessonPublishDate || (lessonPublishDate && hasPublishDatePassed))) {
			date = this.getDefaultDate();
			this.datepicker.setValue(date);
			this.setPublishOnDateText(date);
		}
	},

	reset: function () {
		this.setInitialState();
	},

	handleSelectionClick: function (e) {
		var el = Ext.get(e.target);

		e.stopEvent();
		this.select(el);
	},

	onPublishOnDateClick: function (e) {
		var el = Ext.get(e.target);

		e.stopEvent();

		if (!this.datepicker) {
			this.createDatePicker(this.publishOnDateEl.down('.date-picker-container'));
		}

		this.select(el);
	},

	onSave: function (e) {
		var selectedEl = this.el.down('.option.selected'),
			action = selectedEl && selectedEl.getAttribute('data-action');

		e.stopEvent();
		if (action === 'publish-date') {
			if (this.datepicker && this.datepicker.isValid && this.datepicker.isValid() === false) {
				if (this.datepicker.showErrors) {
					this.datepicker.showErrors();
				}
			}
			else {
				this.publishOnDateSave();
			}
		}
		else if (action === 'publish') {
			this.publishSave();
		}
		else {
			this.unpublishSave();
		}
	},

	publishSave: function () {
		var me = this;

		Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publish(me.contents)
		])
		.then(function (o) {
			var lesson = o[1];

			if (me.setPublished) {
				me.setPublished(lesson);
			}
		});
	},

	publishOnDateSave: function () {
		var dateValue = this.datepicker && this.datepicker.getValue(),
			me = this;

		if (!dateValue) { return; }

		Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publishOnDate(me.contents, dateValue)
		])
		.then(function (o) {
			var lesson = o[1];

			if (me.setWillPublishOn) {
				me.setWillPublishOn(lesson);
			}
		});
	},

	unpublishSave: function () {
		var me = this;

		Promise.all([
			me.EditingActions.unpublish(me.record),
			me.EditingActions.unpublish(me.contents)
		])
		.then(function (o) {
			var lesson = o[1];
			if (me.setNotPublished) {
				me.setNotPublished(lesson);
			}
		});
	},

	createDatePicker: function (dateContainer) {
		//If we've already set on up, no need to create a new one
		if (this.datepicker) { return; }

		var c = this.contents, parentEl = dateContainer || Ext.getBody(),
			begin = this.contents && this.contents.get('publishBeginning'),
			hasPublishDatePassed = c && c.hasPublishDatePassed && c.hasPublishDatePassed(),
			defaultValue = begin && new Date(begin);

		// If the publish date has already passed, don't show it. Use the default date.
		if (!defaultValue || (begin && hasPublishDatePassed)) {
			defaultValue = this.getDefaultDate();
		}

		this.datepicker = Ext.widget({
			xtype: 'date-picker-field',
			defaultValue: defaultValue,
			renderTo: parentEl,
			dateChanged: this.dateChanged.bind(this),
			minDate: new Date()
		});

		this.on('destroy', this.datepicker.destroy.bind(this.datepicker));
	},

	getDefaultDate: function () {
		var defaultValue = new Date();

		// Set it to tomorrow at mid night.
		defaultValue.setDate(defaultValue.getDate() + 1);
		defaultValue.setHours(23);
		defaultValue.setMinutes(59);
		defaultValue.setSeconds(0);

		return defaultValue;
	},

	dateChanged: function () {
		var time = this.datepicker.getValue(),
			date = new Date(time * 1000);

		this.setPublishOnDateText(date);
		if (this.saveBtnEl.hasCls('disabled')) {
			this.saveBtnEl.removeCls('disabled');
		}
	},

	setPublishOnDateText: function (date) {
		var targetEl = this.publishOnDateEl.down('.description'),
			time = this.getDisplayDateValue(date);

		if (targetEl) {
			targetEl.update('Lesson contents will be visible to students on ' + time);
		}
	},

	getDisplayDateValue: function (date) {
		var hour, minutes,
			meridiemVal;

		if (date instanceof Date) {
			hour = date.getHours();
			minutes = date.getMinutes();
			meridiemVal = hour >= 12 ? 'PM' : 'AM';
			hour = hour > 12 ? hour - 12 : hour;

			// Since we're in the AM/PM, 0 hour == 12 hour
			if (hour === 0) {
				hour = 12;
			}

			date = Ext.Date.format(date, 'F d');
			return date + ' at ' + hour + ':' + minutes + ' ' + meridiemVal;
		}

		return null;
	},

	select: function (el) {
		var t = el && el.hasCls('option') ? el : el && el.up('.option'),
			selectedEl = this.el.down('.selected');

		if (!Ext.isEmpty(this.initialState) && t !== this.initialState) {
			this.saveBtnEl.removeCls('disabled');
			delete this.initialState;
		}

		if (!t || !selectedEl) { return; }

		selectedEl.removeCls('selected');
		t.addCls('selected');

		this.realign();
	}
});
