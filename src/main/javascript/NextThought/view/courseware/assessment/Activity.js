Ext.define('NextThought.view.courseware.assessment.Activity', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-activity',

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
			{name: 'containerId', type: 'string'},
			{name: 'label', type: 'string'},
			{name: 'target', type: 'string'},
			{name: 'date', type: 'date'}
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
		this.mon(this.store, 'datachanged', 'maybeNotify');
	},


	setAssignmentsData: function(assignments, history, outline) {
		var ntiid, me = this;

		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No data??');
			return;
		}

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
		return {
			ntiid: target.getId(),
			containerId: target.get('containerId'),
			item: target,
			label: label,
			target: target.get('title'),
			date: date
		};
	},


	collectEvents: function(o, history) {
		var me = this,
			now = new Date(),
			s = me.store,
			h = history.getItem(o.getId()),
			submission = h && h.get('Submission'),
			feedback = h && h.get('Feedback'),
			grade = h && h.get('Grade'),
			dateOpens = o.get('availableBeginning'),
			dateDue = o.get('availableEnding') || now,
			dateCompleted = submission && submission.get('CreatedTime');

		function add() {
			try {
				return s.add.apply(s, arguments);
			} catch (er) {
				console.error(arguments, er.stack || er.message || e);
			}
		}

		if (feedback) {
			feedback.get('Items').forEach(function(f) {
				var c = f.get('Creator'),
					str = ' left feedback on',
					r = add(me.getEventConfig(c + str, o, f.get('CreatedTime')));

				UserRepository.getUser(f).done(function(u) {
					r.set('label', u + str);
				});
			});
		}

		if (grade) {
			add(me.getEventConfig('Grade Received', o, grade.get('CreatedTime')));
		}

		if (dateOpens < now) {
			add(me.getEventConfig('New Assignment:', o, dateOpens));
		}

		if (dateDue < now && (!dateCompleted || dateCompleted > dateDue)) {
			add(me.getEventConfig('Assignment Past Due:', o, dateDue));
		}

		if (dateCompleted) {
			add(me.getEventConfig('Assignment Submitted:', o, dateCompleted));
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
	}
});
