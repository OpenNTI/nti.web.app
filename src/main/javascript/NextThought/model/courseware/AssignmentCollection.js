Ext.define('NextThought.model.courseware.AssignmentCollection', {
	extend: 'NextThought.model.Base',

	statics: {
		fromJson: function(assignments, notAssignments, rosterURL, gradeBook, historyBaseURL) {
			if (!assignments) { return null; }
			var ASSIGNMENT = 'application/vnd.nextthought.assessment.assignment',
				href = assignments.href, collection, hitmap = {}, nodemap = {};

			function filter(i) {
				return i.MimeType === ASSIGNMENT && i.NTIID;
			}

			function count(c, i) {
				return c + (filter(i) ? NaN : 1);//NaN will mean we saw an assignment.
			}

			function build(json) {
				var items = [], key;
				delete json.href;

				for (key in json) {
					if (json.hasOwnProperty(key)) {
						items.push.apply(items, json[key]);
						hitmap[key] = json[key].reduce(count, 0);
						nodemap[key] = json[key].filter(filter);
					}
				}
				return items;
			}

			collection = this.create({
				Roster: rosterURL,
				BaseURL: (historyBaseURL || '').split('/').slice(0, -1).join('/'),
				HitMap: hitmap,
				NodeMap: nodemap,
				Items: build(assignments),
				NotItems: build(notAssignments),
				href: href});

			if (gradeBook) {
				collection.applyGradeBook(gradeBook);
			}

			return collection;
		}
	},

	fields: [
		{name: 'HitMap', type: 'auto'},
		{name: 'NodeMap', type: 'auto'},
		{name: 'Items', type: 'arrayItem'},
		{name: 'NotItems', type: 'arrayItem'},//silly name, I know.
		{name: 'Roster', type: 'string'},
		{name: 'BaseURL', type: 'string'}
	],


	pageContainsAssignment: function(ntiid) {
		var p = this.get('HitMap')[ntiid];

		// If p is NaN, we directly saw an assignment when we built the collection on this ntiid.
		// If p is 0, there was a reference with 0 items in it. Indicating there is something we cannot see.
		// If p is undefiend, there is nothing known about that ntiid.
		// If p is greater than 0, there are assessment items (but no assignments) on that ntiid.
		if (isNaN(p) || p === 0) {
			return this.get('NodeMap')[ntiid];//return canidate assignment IDs
		}

		return false;
	},


	isAssignment: function(id) {
		//Its an assignment unless its listed in the "NotItems"
		return (!!this.getItem(id)) || (!this.getItem(id, 'NotItems'));
	},


	isEmpty: function() {
		return this.get('Items').length === 0;
	},


	each: function() {
		var a = this.get('Items') || [];
		return a.forEach.apply(a, arguments);
	},


	map: function() {
		var a = this.get('Items') || [];
		return a.map.apply(a, arguments);
	},


	getItem: function(id, field) {
		var items = this.get(field || 'Items');

		items = items.filter(function(rec) {
			return rec.getId() === id || (rec.containsId && rec.containsId(id));
		});

		return items[0];
	},


	/**
	 * Sets the gradebook on the collection and all sub-items. So that when the
	 * history items load, we force the Grade instance to be the shared instance.
	 *
	 * @param {NextThought.model.courseware.GradeBook} gradeBook
	 * @private
	 */
	applyGradeBook: function(gradeBook) {
		this.gradeBook = gradeBook;
		this.each(function(a) {
			a.setGradeBookEntryFrom(gradeBook);
		});
	},


	getRosterURL: function() { return this.get('Roster'); },


	/**
	 * Builds or returns the existing store that represents a students view. Listing assignments for just one student.
	 *
	 * @param {String} student - Username of the student to drill down on.
	 * @return {Ext.data.Store}
	 */
	getViewForStudent: function(student) {
		var url, store, me = this;
		me._studentViews = me._studentViews || {};

		function fill(s, recs, good) {
			if (!good) {return;}
			var rec, id, exists = {},
				toAdd = [], toRemove = [],
				get = me.getItem.bind(me),
				r = recs.length - 1;

			s.suspendEvents(true);

			for (r; r >= 0; r--) {
				rec = recs[r];
				try {
					id = rec.getAssignmentId();
					rec.set('item', get(id));
					exists[id] = rec;
				} catch (e) {
					console.warn(e.stack || e.message || e);
				}
			}

			me.each(function(a) {
				var r = exists[a.getId()],
					gbe = a._gradeBookEntry,
					grade = gbe && gbe.getFieldItem('Items', student),
					show = !a.doNotShow();

				if (!r && show) {
					toAdd.push(NextThought.model.courseware.UsersCourseAssignmentHistoryItem.create({
						Creator: student,
						item: a,
						Grade: grade
					}));
				} else if (grade && show) {
					r.set('Grade', grade);
				}

				if (r && !show) {
					toRemove.push(r);
				}
			});

			s.remove(toRemove, true);
			if (toAdd.length) { s.add(toAdd); }

			s.sort();

			s.resumeEvents();

			//s.fireEvent();
		}

		if (!me._studentViews[student]) {
			url = [me.get('BaseURL'), student].join('/');
			store = me._studentViews[student] = new NextThought.store.courseware.AssignmentView({
				url: url,
				filters: [],
				sorters: ['due'],
				buffered: false,
				disablePaging: true
			});

			store.on({
				load: fill,
				prefetch: fill
			});
		}

		return me._studentViews[student];
	}
});
