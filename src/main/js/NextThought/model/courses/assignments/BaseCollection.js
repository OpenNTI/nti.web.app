export default Ext.define('NextThought.model.courses.assignments.BaseCollection', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.courseware.UsersCourseAssignmentHistory',
		'NextThought.model.courseware.UsersCourseAssignmentHistoryItem'
	],


	inheritableStatics: {
		ASSIGNMENT: 'application/vnd.nextthought.assessment.assignment',
		TIMEDASSIGNMENT: 'application/vnd.nextthought.assessment.timedassignment',


		__parseHistoryURL: function(url) {
			return url;
		},

		fromJson: function(assignments, nonAssignments, gradeBook, historyURL) {
			if (!assignments) { return null; }

			assignments = assignments.Items || assignments;
			nonAssignments = nonAssignments && (nonAssignments.Items || nonAssignments);

			var assignmentMimeType = this.ASSIGNMENT,
				timedAssignmentMimeType = this.TIMEDASSIGNMENT,
				href = assignments.href, hitmap = {}, nodemap = {};

			//filter out items that aren't an assignment or don't have an ntiid
			function filter(i) {
				return (i.MimeType === assignmentMimeType || i.MimeType === timedAssignmentMimeType) && i.NTIID;
			}

			function count(c, i) {
				return c + (filter(i) ? NaN : 1);//NaN will mean we saw an assignment
			}

			function build(json) {
				var items = [], key;

				delete json.href;

				for (key in json) {
					if (json.hasOwnProperty(key)) {
						//json[key] should be an array so push all the items
						items.push.apply(items, json[key]);
						hitmap[key] = json[key].reduce(count, 0);
						nodemap[key] = json[key].filter(filter);
					}
				}

				return items;
			}

			return this.create({
				HitMap: hitmap,
				NodeMap: nodemap,
				Assignments: build(assignments),
				NonAssignments: build(nonAssignments),
				HistoryURL: this.__parseHistoryURL(historyURL),
				GradeBook: gradeBook
			});
		}
	},

	fields: [
		{name: 'HitMap', type: 'auto'},
		{name: 'NodeMap', type: 'auto'},
		{name: 'Assignments', type: 'arrayItem'},
		{name: 'NonAssignments', type: 'arrayItem'},
		{name: 'HistoryURL', type: 'String'},
		{name: 'GradeBook', type: 'auto'}
	],


	pageContainsAssignment: function(ntiid) {
		var p = this.get('HitMap')[ntiid];

		// If p is NaN, we directly saw an assignment when we built the collection on this ntiid.
		// If p is 0, there was a reference with 0 items in it. Indicating there is something we cannot see.
		// If p is undefined, there is nothing known about that ntiid.
		// If p is greater than 0, there are assessment items (but no assignments) on that ntiid.
		if (isNaN(p) || p === 0) {
			return this.get('NodeMap')[ntiid];//return candidate assignment IDs
		}

		return false;
	},


	isAssignment: function(id) {
		//Its an assignment unless its listed in the "NotItems"
		return (!!this.getItem(id)) || (!this.getItem(id, 'NonAssignments'));
	},


	isEmpty: function() {
		return this.get('Assignments').length === 0;
	},


	each: function() {
		var a = this.get('Assignments') || [];
		return a.forEach.apply(a, arguments);
	},


	map: function() {
		var a = this.get('Assignments') || [];
		return a.map.apply(a, arguments);
	},


	getItem: function(id, field) {
		var items = this.get(field || 'Assignments');

		if (!id) {
			return null;
		}

		items = items.filter(function(rec) {
			return rec.getId().toLowerCase() === id.toLowerCase() || (rec.containsId && rec.containsId(id));
		});

		return items[0];
	},


	getCount: function() {
		var items = this.get('Assignments');

		return items.length;
	},


	getAssignmentsForContainer: function(containerId) {
		var items = this.get('Assignments') || [],
			assignments = [];

		items.forEach(function(item) {
			if (item.get('ContainerId') === containerId) {
				assignments.push(item);
			}
		});

		return assignments;
	},


	getGradeBook: function() {
		return this.get('GradeBook');
	},


	//override these
	getGradeBookEntry: function(assignment) { return Promise.resolve(null); },
	getGradeFor: function(assignment, user) { return Promise.resolve(null); },

	/**
	 * Get the no submit assignment that has a title of Final Grade if there is one
	 * TODO: figure out where there is a link to this to compare instead
	 * @return {Assignment} the final grade assignment or null if there isn't one
	 */
	getFinalGradeAssignment: function() {
		if (this.__finalGrade !== undefined) { return this.__finalGrade; }

		var me = this,
			finalGrade = null;

		me.each(function(assignment) {
			if (me.isFinalGradeAssignment(assignment)) {
				finalGrade = assignment;
			}
		});

		me.__finalGrade = finalGrade;

		return me.__finalGrade;
	},


	isFinalGradeAssignment: function(assignment) {
		return assignment.isNoSubmit() && assignment.get('title') === 'Final Grade';
	},


	hasFinalGrade: function() {
		return !!this.getFinalGradeAssignment();
	}
});
