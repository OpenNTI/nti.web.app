Ext.define('NextThought.view.courseware.assessment.Activity', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-activity',

	view: 'student',
	ui: 'course-assessment',
	cls: 'course-assessment-activity scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: '{title}'},
		{ cls: 'list'}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	itemSelector: '.item',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item {[this.isUnread(values.date)]}', cn: [
							{ tag: 'time', cls: 'datetime', datetime: '{date:date("c")}', html: '{[this.getTime(values.date)]}'},
							{ tag: 'span', cls: 'label', html: '{label:htmlEncode} '},
							{ tag: 'span', cls: 'target', html: '{target:htmlEncode}'}
						]}
					]}), {
				//template functions

				isUnread: function(date) {
					return date > this.ownerCmp.getLastRead() ? 'unread' : '';
				},

				getTime: function(date) {
					var format = 'M j',
							today = new Date((new Date()).setHours(0, 0, 0, 0));
					if (date > today) {
						format = 'g:i a';
					}
					return Ext.Date.format(date, format);
				}
			}),


	store: new Ext.data.Store({
		fields: [
			{name: 'ntiid', type: 'string'},
			{name: 'label', type: 'string'},
			{name: 'target', type: 'string'},
			{name: 'date', type: 'date'},
			{name: 'item', type: 'auto'},
			{name: 'user', type: 'auto'}
		],
		sorters: [
			{property: 'date', direction: 'DESC'}
		]
	}),


	clear: function() {
		this.store.removeAll();
	},


	initComponent: function() {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;
		this.setTitle(this.title);
		this.enableBubble(['goto-assignment']);
		this.mon(this.store, 'datachanged', 'maybeNotify');
		this.on({
			deactivate: 'clearBadge',
			itemclick: 'goToAssignment'
		});
	},


	clearBadge: function() {
		this.notifications = 0;
		this.fireEvent('notify', 0);
		this._lastRead = new Date();
		Ext.Ajax.request({
			url: this.history.get('href') + '/lastViewed',
			method: 'PUT',
			jsonData: this._lastRead
		});

		this.refresh();
	},


	setAssignmentsData: function(assignments, history, outline) {
		var ntiid, me = this;

		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No data??');
			return;
		}

		this.assignments = {};
		this.history = history;
		this._lastRead = history.get('lastViewed');

		delete assignments.href;//all other keys are container ids...so, lets just drop it.

		function collect(agg, o) { me.collectEvents(o, history); }

		for (ntiid in assignments) {
			if (assignments.hasOwnProperty(ntiid)) {
				if (!ParseUtils.isNTIID(ntiid)) {//just to be safe
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}

				ParseUtils.parseItems(assignments[ntiid]).reduce(collect, 0);
			}
		}
	},


	clearAssignmentsData: function() { this.clear(); },


	getEventConfig: function(label, target, date) {
		if (typeof target === 'string') {
			target = this.assignments[target];
		}

		return {
			ntiid: target.getId(),
			item: target,
			label: label,
			target: target.get('title'),
			date: date
		};
	},


	addEvent: function() {
		var s = this.store;
		try {
			return s.add.apply(s, arguments)[0];
		} catch (er) {
			console.error(arguments, er.stack || er.message || e);
		}
	},


	collectEvents: function(o, historyCollection) {
		var h = historyCollection.getItem(o.getId());
		this.assignments[o.getId()] = o;
		this.deriveEvents(o, h);
	},


	deriveEvents: function(assignemnt, historyItem) {
		var me = this,
			now = new Date(),
			submission = historyItem && historyItem.get('Submission'),
			feedback = historyItem && historyItem.get('Feedback'),
			grade = historyItem && historyItem.get('Grade'),
			dateCompleted = submission && submission.get('CreatedTime'),
			dateOpens = assignemnt && assignemnt.get('availableBeginning'),
			dateDue = (assignemnt && assignemnt.get('availableEnding')) || now;


		if (feedback) {
			feedback.get('Items').forEach(function(f) {
				me.addFeedback(f);
			});
		}

		if (grade && grade.get('value')) {
			me.addEvent(me.getEventConfig('Grade Received', assignemnt, grade.get('Last Modified')));
		}

		if (dateOpens < now) {
			me.addEvent(me.getEventConfig('New Assignment:', assignemnt, dateOpens));
		}

		if (dateDue < now && (!dateCompleted || dateCompleted > dateDue)) {
			me.addEvent(me.getEventConfig('Assignment Past Due:', assignemnt, dateDue));
		}

		if (dateCompleted) {
			me.addEvent(me.getEventConfig('Assignment Submitted:', assignemnt, dateCompleted));
		}
	},


	addFeedback: function(f) {
		var c = f.get('Creator'),
			str = isMe(c) ? ' commented on' : ' left feedback on',
			label = ((isMe(c) && 'You') || c) + str,
			r = this.addEvent(this.getEventConfig(label, f.get('AssignmentId'), f.get('CreatedTime')));

		if (!isMe(c)) {
			UserRepository.getUser(c).done(function(u) {
				r.set({
					label: u + str,
					user: u
				});
			});
		}
	},


	setTitle: function(title) {
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


	maybeNotify: function(store) {
		var count = 0, d = this.getLastRead();

		store.each(function(r) {
			if (r.get('date') > d) {
				count++;
			}
		});

		this.notifications = count;
		this.fireEvent('notify', count);
	},


	getLastRead: function() {
		return this._lastRead || new Date(0);
	},


	goToAssignment: function(s, record) {
		this.fireEvent('goto-assignment', record.get('item'), $AppConfig.userObject);
	}
});
