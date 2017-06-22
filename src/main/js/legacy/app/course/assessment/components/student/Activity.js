const Ext = require('extjs');

const {getFormattedString} = require('legacy/util/Localization');
const UserRepository = require('legacy/cache/UserRepository');
const {isMe} = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');

require('legacy/mixins/Router');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.student.Activity', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-activity',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	view: 'student',
	ui: 'course-assessment',
	cls: 'course-assessment-activity',
	preserveScrollOnRefresh: true,
	emptyText: Ext.DomHelper.markup({ cls: 'empty-text', html: 'There is no activity.'}),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: '{title}'},
		{ cls: 'list'},
		{ cls: 'more hidden', html: '{{{NextThought.view.courseware.assessment.Activity.more}}}', tabIndex: 0}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list',
		loadMoreLink: '.more'
	},

	getTargetEl: function () { return this.frameBodyEl; },
	itemSelector: '.item',

	tpl: new Ext.XTemplate(
		Ext.DomHelper.markup(
			{ tag: 'tpl', 'for': '.', cn: [
				{ cls: 'item {[this.isUnread(values.date)]}', cn: [
					{ tag: 'time', cls: 'datetime', datetime: '{date:date("c")}', html: '{[this.getTime(values.date)]}'},
					{ tag: 'span', cls: 'label', html: '{label:htmlEncode} '},
					{ tag: 'span', cls: 'target', html: '{target:htmlEncode}'},
					{ tag: 'tpl', 'if': 'suffix', cn: { tag: 'span', cls: 'label suffix', html: '{suffix:htmlEncode}'}}
				]}
			]}), {
			//template functions

			isUnread: function (date) {
				return date > this.ownerCmp.getLastRead() ? 'unread' : '';
			},

			getTime: function (date) {
				var format = 'M j',
					today = new Date((new Date()).setHours(0, 0, 0, 0));
				if (date > today) {
					format = 'g:i a';
				}
				return Ext.Date.format(date, format);
			}
		}),

	clear: function () {
		this.store.removeAll();
	},

	initComponent: function () {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;
		this.setTitle(this.title);
		this.enableBubble(['goto-assignment', 'close-reader']);

		this.store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'int'},
				{name: 'ntiid', type: 'string'},
				{name: 'label', type: 'string'},
				{name: 'target', type: 'string'},
				{name: 'date', type: 'date'},
				{name: 'item', type: 'auto'},
				{name: 'user', type: 'auto'},
				{name: 'suffix', type: 'auto'}
			],
			sorters: [
				{property: 'date', direction: 'DESC'}
			]
		});

		this.bindStore(this.store);
		this.mon(this.store, 'datachanged', 'maybeNotify');

		this.on({
			deactivate: 'clearBadge',
			itemclick: 'goToAssignment',
			loadMoreLink: { click: 'onLoadMore' }
		});
	},

	restoreState: function (state, active) {
		if (active) {
			this.fireEvent('close-reader');
		}
	},

	onLoadMore: function () {},

	onAdded: function () {
		function monitorCardChange (cmp, me) {
			var c = cmp.up('{isOwnerLayout("card")}');
			me = me || cmp;
			if (c) {
				me.mon(c, {
					deactivate: me.maybeClearBadge,
					scope: me
				});
				monitorCardChange(c, me);
			}
		}

		this.callParent(arguments);
		monitorCardChange(this);
	},

	maybeClearBadge: function (deactivatedCmp) {
		var c = this;
		while (c && c.isVisible()) {
			c = c.up();
		}

		if (c === deactivatedCmp) {
			console.debug('Clear badge');
			this.clearBadge();
		} else {
			console.debug('Not clearing badge ' + (c && c.id));
		}
	},

	clearBadge: function () {
		if (this.notifications === 0) {
			return;
		}
		this.notifications = 0;
		this.fireEvent('notify', 0);
		this._lastRead = new Date();
		if (this._lastViewedURL) {
			Ext.Ajax.request({
				url: this._lastViewedURL,
				method: 'PUT',
				jsonData: this._lastRead.getTime() / 1000
			});
		}

		this.refresh();
	},

	setAssignmentsData: function (assignments, instance, savepoints) {
		var me = this,
			waitsOn = [];

		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No data??');
			return Promise.reject('No data?');
		}

		this.assignments = {};
		this.savepoints = savepoints;

		//given an assignment figure out what activity item to add
		function collect (o) {
			waitsOn.push(
				assignments.getHistoryItem(o.getId(), true)
					.always(me.collectEvents.bind(me, o))
			);
		}

		assignments.each(collect);

		//passed true so it uses the cached copy and doesn't make a needless request
		assignments.getHistory(true)
			.then(me.setLastReadFrom.bind(this));

		return Promise.all(waitsOn);
	},

	clearAssignmentsData: function () { this.clear(); },

	getEventConfig: function (label, target, date) {
		var a = this.assignments;
		if (typeof target === 'string') {
			if (!a.hasOwnProperty(target)) {
				console.error('Dropping event, no assignment found in the map for:', target);

				Error.raiseForReport((function () {
					const keys = Object.keys(a);
					const p = String.commonPrefix(keys);

					function trim (i) { return i.substring(p.length); }

					return ('Content ID change? No assignment found for: ' +
									trim(target) +
									' in: [' + keys.map(trim).join(', ') + ']');
				}()));

				return null;
			}
			target = a[target];
		}

		return {
			ntiid: target && target.getId(),
			item: target,
			label: label,
			target: (target && target.get('title')),
			date: date
		};
	},

	addEvent: function (r) {
		var s = this.store;
		try {
			return (r && s.add.apply(s, arguments)[0]) || null;
		} catch (er) {
			console.error(arguments, er.stack || er.message || er);
		}
	},

	collectEvents: function (o, historyItem) {
		this.assignments[o.getId()] = o;
		//if (o.doNotShow()) { return; }

		this.deriveEvents(o, historyItem);
	},

	deriveEvents: function (assignment, historyItem) {
		var me = this,
			now = new Date(),
			submission = historyItem && historyItem.get && historyItem.get('Submission'),
			feedback = historyItem && historyItem.get && historyItem.get('Feedback'),
			grade = historyItem && historyItem.get && historyItem.get('Grade'),
			dateCompleted = submission && submission.get('CreatedTime'),
			dateOpens = assignment && assignment.get('availableBeginning'),
			dateDue = (assignment && assignment.get('availableEnding')) || now,
			parts = assignment.get('parts') || [],
			hasParts = parts.length > 0;


		if (feedback) {
			feedback.get('Items').forEach(function (f) {
				me.addFeedback(f);
			});
		}

		if (grade && grade.get('value')) {
			me.addEvent(me.getEventConfig(getString('NextThought.view.courseware.assessment.Activity.gradereceived'), assignment, grade.get('Last Modified')));
		}

		if (dateOpens < now) {
			me.addEvent(me.getEventConfig(getString('NextThought.view.courseware.assessment.Activity.newassignment'), assignment, dateOpens));
		}

		if (dateDue < now && (!dateCompleted || dateCompleted > dateDue) && hasParts) {
			me.addEvent(me.getEventConfig(getString('NextThought.view.courseware.assessment.Activity.lateassignment'), assignment, dateDue));
		}

		if (dateCompleted && submission && (submission.get('parts') || []).length > 0) {
			me.addEvent(me.getEventConfig(getString('NextThought.view.courseware.assessment.Activity.submittedassignment'), assignment, dateCompleted));
		}
	},

	addFeedback: function (f) {
		const c = f.get('Creator');
		const r = this.createFeedbackEvent(f);

		if (r) {
			if (!isMe(c)) {
				UserRepository.getUser(c).then(function (u) {
					r.set({
						label: getFormattedString('NextThought.view.courseware.assessment.Activity.theyfeedback', {name: u}),
						user: u
					});
				});
			} else {
				r.set('user', $AppConfig.userObject);
			}
		}

		return r;
	},

	createFeedbackEvent (f) {
		var c = f.get('Creator'),
			label = isMe(c) ?
				getFormattedString('NextThought.view.courseware.assessment.Activity.youfeedback', {name: 'You'}) :
				getFormattedString('NextThought.view.courseware.assessment.Activity.theyfeedback', {name: '--'});

		return this.addEvent(this.getEventConfig(label, f.get('AssignmentId'), f.get('CreatedTime')));
	},

	setTitle: function (title) {
		this.title = title;
		if (this.titleEl) {
			this.titleEl.update(title);
		}
		else {
			this.renderData = Ext.apply(this.renderData || {}, {
				title: title
			});
		}
	},

	maybeNotify: function (store) {
		var count = 0, d = this.getLastRead();

		store.each(function (r) {
			if (r.get('date') > d) {
				count++;
			}
		});

		this.notifications = count;
		this.fireEvent('notify', count);
		this.refresh();
	},

	getLastRead: function () {
		return this._lastRead || new Date();//don't show the notifications until we load the last view time.
	},

	setLastReadFrom: function (container) {
		this._lastRead = (container && container.get('lastViewed')) || new Date(0);
		this._lastViewedURL = container && container.getLink('lastViewed');
		this.maybeNotify(this.store);
	},

	goToAssignment: function (s, record) {
		var assignment = record.get('item');

		if (!assignment) {
			console.error('No Assignment to navigate to');
			return;
		}

		this.navigateToObject(assignment);
	}
});
