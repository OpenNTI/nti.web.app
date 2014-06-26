Ext.define('NextThought.view.courseware.assessment.Activity', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-activity',

	view: 'student',
	ui: 'course-assessment',
	cls: 'course-assessment-activity scrollable',
	preserveScrollOnRefresh: true,

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

	getTargetEl: function() { return this.frameBodyEl; },
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
			itemclick: 'fireGoToAssignment',
			loadMoreLink: { click: 'onLoadMore' }
		});
	},


	onLoadMore: function() {},


	onAdded: function() {
		function monitorCardChange(cmp, me) {
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


	maybeClearBadge: function(deactivatedCmp) {
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


	clearBadge: function() {
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


	setAssignmentsData: function(assignments, history) {
		var me = this;

		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No data??');
			return Promise.reject('No data?');
		}

		this.assignments = {};

		function collect(o) { me.collectEvents(o, history); }

		assignments.get('Items').forEach(collect);

		this.setLastReadFrom(history);
		return Promise.resolve();
	},


	clearAssignmentsData: function() { this.clear(); },


	getEventConfig: function(label, target, date) {
		var a = this.assignments;
		if (typeof target === 'string') {
			if (!a.hasOwnProperty(target)) {
				console.error('Dropping event, no assignment found in the map for:', target);

				Error.raiseForReport((function() {
					function trim(i) { return i.substring(p.length); }

					var keys = Object.keys(a),
						p = String.commonPrefix(keys);

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


	addEvent: function(r) {
		var s = this.store;
		try {
			return (r && s.add.apply(s, arguments)[0]) || null;
		} catch (er) {
			console.error(arguments, er.stack || er.message || e);
		}
	},


	collectEvents: function(o, historyCollection) {
		this.assignments[o.getId()] = o;
		//if (o.doNotShow()) { return; }

		var h = historyCollection && historyCollection.getItem(o.getId());
		this.deriveEvents(o, h);
	},


	deriveEvents: function(assignment, historyItem) {
		var me = this,
			now = new Date(),
			submission = historyItem && historyItem.get('Submission'),
			feedback = historyItem && historyItem.get('Feedback'),
			grade = historyItem && historyItem.get('Grade'),
			dateCompleted = submission && submission.get('CreatedTime'),
			dateOpens = assignment && assignment.get('availableBeginning'),
			dateDue = (assignment && assignment.get('availableEnding')) || now,
			parts = assignment.get('parts') || [],
			hasParts = parts.length > 0;


		if (feedback) {
			feedback.get('Items').forEach(function(f) {
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


	addFeedback: function(f) {
		var c = f.get('Creator'),
			label = isMe(c) ?
				getFormattedString('NextThought.view.courseware.assessment.Activity.youfeedback', {name: 'You'}) :
				getFormattedString('NextThought.view.courseware.assessment.Activity.theyfeedback', {name: '--'}),
			r = this.addEvent(this.getEventConfig(label, f.get('AssignmentId'), f.get('CreatedTime')));

		if (r) {
			if (!isMe(c)) {
				UserRepository.getUser(c).done(function(u) {
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
		this.refresh();
	},


	getLastRead: function() {
		return this._lastRead || new Date();//don't show the notifications until we load the last view time.
	},


	setLastReadFrom: function(container) {
		this._lastRead = (container && container.get('lastViewed')) || new Date(0);
		this._lastViewedURL = container && container.getLink('lastViewed');
		this.maybeNotify(this.store);
	},


	fireGoToAssignment: function(s, record) {
		this.fireEvent('goto-assignment', record.get('item'), $AppConfig.userObject);
	}
});
