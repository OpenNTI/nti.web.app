const Ext = require('@nti/extjs');

require('../../Base');
require('legacy/mixins/DurationCache');
require('../../courseware/UsersCourseAssignmentHistory');
require('../../courseware/UsersCourseAssignmentHistoryItem');
require('../../assessment/Assignment');
require('../../assessment/DiscussionAssignment');


module.exports = exports = Ext.define('NextThought.model.courses.assignments.BaseCollection', {
	extend: 'NextThought.model.Base',

	mixins: {
		DurationCache: 'NextThought.mixins.DurationCache'
	},

	assignmentUpdateKey: 'update-assignments',

	inheritableStatics: {
		ASSIGNMENT: 'application/vnd.nextthought.assessment.assignment',
		TIMEDASSIGNMENT: 'application/vnd.nextthought.assessment.assignment',


		__parseHistoryURL: function (url) {
			return url;
		},


		parseOutline: function (json) {
			var outline = json.Outline,
				map = {}, key, i, list, id;

			for (key in outline) {
				if (outline.hasOwnProperty) {
					list = outline[key] || [];

					for (i = 0; i < list.length; i++) {
						id = list[i];

						if (map[id]) {
							map[id].push(key);
						} else {
							map[id] = [key];
						}
					}
				}
			}

			return map;
		},


		parseData: function (assignments, nonAssignments) {
			var collection = assignments;

			assignments = assignments.Items || assignments;
			nonAssignments = nonAssignments && (nonAssignments.Items || nonAssignments);

			var assignmentMimeType = this.ASSIGNMENT,
				timedAssignmentMimeType = this.TIMEDASSIGNMENT,
				hitmap = {}, nodemap = {};

			//filter out items that aren't an assignment or don't have an ntiid
			function filter (i) {
				return (i.MimeType === assignmentMimeType || i.MimeType === timedAssignmentMimeType) && i.NTIID;
			}

			function count (c, i) {
				return c + (filter(i) ? NaN : 1);//NaN will mean we saw an assignment
			}

			function build (json) {
				var items = [], key;

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

			return {
				HitMap: hitmap,
				NodeMap: nodemap,
				Assignments: build(assignments),
				NonAssignments: build(nonAssignments),
				AssignmentToOutlineNodes: this.parseOutline(collection)
			};
		},


		fromJson: function (assignments, nonAssignments, gradeBook, historyURL, isAdmin, bundle) {
			if (!assignments) { return null; }

			var itemData = this.parseData(assignments, nonAssignments);

			return this.create({
				HitMap: itemData.HitMap,
				NodeMap: itemData.NodeMap,
				Assignments: itemData.Assignments,
				NonAssignments: itemData.NonAssignments,
				AssignmentsLink: assignments.href,
				NonAssignmentsLink: nonAssignments.href,
				AssignmentToOutlineNodes: this.parseOutline(assignments),
				AssignmentsRaw: assignments,
				NonAssignmentsRaw: nonAssignments,
				GradeBook: gradeBook,
				HistoryURL: historyURL,
				bundle: bundle
			});
		}
	},

	fields: [
		{name: 'HitMap', type: 'auto'},
		{name: 'NodeMap', type: 'auto'},
		{name: 'Assignments', type: 'arrayItem'},
		{name: 'NonAssignments', type: 'arrayItem'},
		{name: 'HistoryURL', type: 'String'},
		{name: 'GradeBook', type: 'auto'},
		{name: 'AssignmentToOutlineNodes', type: 'auto'},
		{name: 'AssignmentsLink', type: 'string'},
		{name: 'AssignmentsRaw', type: 'auto'},
		{name: 'NonAssignmentsRaw', type: 'auto'},
		{name: 'bundle', type: 'auto'}
	],

	constructor: function () {
		this.callParent(arguments);

		this.cacheForShortPeriod(this.assignmentUpdateKey, Promise.resolve(this));
	},

	pageContainsAssignment: function (ntiid) {
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

	__updateData: function (assignments, nonAssignments) {
		assignments = assignments || this.get('AssignmentsRaw');
		nonAssignments = nonAssignments || this.get('NonAssignmentsRaw');

		var data = this.self.parseData(assignments, nonAssignments);

		this.set(data);

		return this;
	},

	updateAssignments: function (force) {
		var me = this,
			key = me.assignmentUpdateKey,
			load, link = me.get('AssignmentsLink');

		load = !force && me.getFromCache(key);

		if (!load) {
			load = Service.request(link)
				.then(function (response) {
					return Ext.decode(response, true);
				})
				.then(function (assignments) {
					return me.__updateData(assignments, null);
				});

			me.cacheForShortPeriod(key, load);
		}

		return load;
	},


	appendAssignment (assignment) {
		const assignments = this.get('Assignments');

		if (assignments) {
			assignments.push(assignment);
			this.set('Assignments', assignments);
		}
	},


	isAssignment: function (id) {
		//Its an assignment unless its listed in the "NotItems"
		return (!!this.getItem(id)) || (!this.getItem(id, 'NonAssignments'));
	},

	isEmpty: function () {
		const assignments = this.get('Assignments');
		const filtered = (assignments || []).filter(x => !x.isDeleted);
		return filtered.length === 0;
	},

	each: function () {
		var a = this.get('Assignments') || [];
		return a.forEach.apply(a, arguments);
	},

	map: function () {
		var a = this.get('Assignments') || [];
		return a.map.apply(a, arguments);
	},

	/**
	 * Search both the assignments and non-assignments for an item with an id
	 * @param  {String} id the id to search for
	 * @return {Object}	   the item if there is one
	 */
	findItem: function (id) {
		var assignment = this.getItem(id),
			nonAssignment = !assignment && this.getItem(id, 'NonAssignments');

		return assignment || nonAssignment;
	},

	getItem: function (id, field) {
		var items = this.get(field || 'Assignments');

		if (!id) {
			return null;
		}

		items = items.filter(function (rec) {
			return rec.getId().toLowerCase() === id.toLowerCase() || (rec.containsId && rec.containsId(id));
		});

		return items[0];
	},

	fetchAssignment: function (id) {
		var assignment = this.getItem(id),
			assignmentId = assignment && assignment.getId();

		if (!assignmentId) {
			return Promise.reject('No assignment found');
		}

		return Service.getObjectWithinBundle(assignmentId, this.get('bundle'))
			.then(function (response) {
				assignment.syncWith(response);

				return assignment;
			});
	},

	getCount: function () {
		var items = this.get('Assignments');

		return items.length;
	},

	getAssignmentsForContainer: function (containerId) {
		var items = this.get('Assignments') || [],
			assignments = [];

		items.forEach(function (item) {
			if (item.get('ContainerId') === containerId) {
				assignments.push(item);
			}
		});

		return assignments;
	},

	getGradeBook: function () {
		return this.get('GradeBook');
	},

	getOutlineNodesContaining: function (assignmentId) {
		var assignmentToOutlineNodes = this.get('AssignmentToOutlineNodes');

		return assignmentToOutlineNodes[assignmentId];
	},

	//override these
	getGradeBookEntry: function (/*assignment*/) { return Promise.resolve(null); },

	getGradeFor: function (/*assignment, user*/) { return Promise.resolve(null); },

	/**
	 * Get the no submit assignment that has a title of Final Grade if there is one
	 * TODO: figure out where there is a link to this to compare instead
	 * @return {Assignment} the final grade assignment or null if there isn't one
	 */
	getFinalGradeAssignment: function () {
		if (this.__finalGrade !== undefined) { return this.__finalGrade; }

		var me = this,
			finalGrade = null;

		me.each(function (assignment) {
			if (me.isFinalGradeAssignment(assignment)) {
				finalGrade = assignment;
			}
		});

		me.__finalGrade = finalGrade;

		return me.__finalGrade;
	},

	isFinalGradeAssignment: function (assignment) {
		return assignment.isNoSubmit() && assignment.get('title') === 'Final Grade';
	},

	hasFinalGrade: function () {
		return !!this.getFinalGradeAssignment();
	}
});
