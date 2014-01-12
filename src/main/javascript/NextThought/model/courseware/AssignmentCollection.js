Ext.define('NextThought.model.courseware.AssignmentCollection', {
	extend: 'NextThought.model.Base',

	statics: {
		fromJson: function(assignments, notAssignments, roster) {
			if (!assignments) { return null; }
			var href = assignments.href;

			function build(json) {
				var items = [], key;
				delete json.href;

				for (key in json) {
					if (json.hasOwnProperty(key)) {
						items.push.apply(items, json[key]);
					}
				}
				return items;
			}

			return this.create({
				Items: build(assignments),
				NotItems: build(notAssignments),
				Roster: roster,
				href: href});
		}
	},

	fields: [
		{name: 'Items', type: 'arrayItem'},
		{name: 'NotItems', type: 'arrayItem'},//silly name, I know.
		{name: 'Roster', type: 'auto'}
	],


	constructor: function() {
		this.callParent(arguments);
		//pass the roster down if we have it.
		var r = this.get('Roster');
		this.each(function(a) { a.roster = r; });
	},


	isAssignment: function(id) {
		//Its an assignment unless its listed in the "NotItems"
		return !this.getItem(id, 'NotItems');
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
			return rec.getId() === id || rec.containsId(id);
		});

		return items[0];
	},


	/**
	 * Sets the gradebook on the collection and all sub-items. So that when the
	 * history items load, we force the Grade instance to be the shared instance.
	 *
	 * @param {NextThought.model.courseware.GradeBook} gradeBook
	 */
	applyGradeBook: function(gradeBook) {
		this._gradeBook = gradeBook;
		this.each(function(a) {
			a.setGradeBookEntryFrom(gradeBook);
		});
	},


	getRoster: function() {
		return this.get('Roster') || [];
	},


	/**
	 * Get an aggrigate view of all students and assignments.
	 */
	getViewMaster: function() {
		return Promise.pool(this.map(function(a) { return a.getSubmittedHistoryStore().promise; }));
	},


	/**
	 * Builds or returns the existing store that represents a students view. Listing assignments for just one student.
	 *
	 * @param {String} student - Username of the student to drill down on.
	 * @return {Ext.data.Store}
	 */
	getViewForStudent: function(student) {
		var v;
		this._studentViews = this._studentViews || {};

		function findFn(o) {
			var c = o.get('Creator'), i = o.get('item'),
				show = !i || !i.doNotShow();
			return show && (typeof c === 'string' ? c : c.getId()) === student;
		}

		function build(assignmentStores) {
			var recs = [];
			function itr(s) {
				var i = s.findBy(findFn);
				if (i >= 0) {
					recs.push(s.getAt(i));
				}
			}
			assignmentStores.forEach(itr);
			v.add(recs);
			v.sort();
		}

		if (!this._studentViews[student]) {
			v = this._studentViews[student] = new NextThought.store.courseware.AssignmentView({proxy: 'memory'});
			this.getViewMaster().done(build);
		}

		return this._studentViews[student];
	},


	/**
	 * This will build or return the existing store of students accross an assignment.
	 *
	 * @param {String} assignmentId - assignment id to drill down on.
	 * @return {Ext.data.Store}
	 */
	getViewForAssignment: function(assignmentId) {
		var a = this.getItem(assignmentId);
		return a && a.getSubmittedHistoryStore();
	}
});
