/*globals User*/
Ext.define('NextThought.store.courseware.GradeBookSummaries', {
	extend: 'Ext.data.Store',

	remoteSort: true,

	fields: [
		{name: 'Alias', type: 'string'},
		{name: 'Username', type: 'string'},
		{name: 'avatar', type: 'string', defaultValue: User.BLANK_AVATAR},
		{name: 'HistoryItemSummary', type: 'auto'},
		{name: 'Grade', type: 'auto'},
		{name: 'OverdueAssignmentCount', type: 'int'},
		{name: 'UngradedAssignmentCount', type: 'int'},
		{name: 'Links', type: 'auto'},
		{name: 'User', type: 'auto'}
	],

	pageSize: 50,

	proxy: {
		type: 'ajax',
		timeout: 360000, //one hour

		url: 'tbd',

		reader: {
			root: 'Items',
			totalProperty: 'TotalItemCount',

			readRecords: function() {
				var data = this.self.prototype.readRecords.apply(this, arguments),
					list = (data && data.records) || [],
					i = list.length - 1, o, u;

				for (i; i >= 0; i--) {
					o = list[i] && list[i].raw;
					u = o && o.User;
					if (u) {
						delete o.UserProfile;
						UserRepository.cacheUser(User.create(u, u.Username), true);
					}
				}

				return data;
			}
		},

		noCache: false,

		groupParam: undefined,
		groupDirectionParam: undefined,
		directionParam: undefined,

		sortParam: 'sort',
		filterParam: 'filter',
		idParam: 'batchAround',

		pageParam: undefined,
		startParam: 'batchStart',
		limitParam: 'batchSize',

		buildUrl: function(request) {
			var sort, dir,
				p = request.params;

			if (p && p.sort) {
				dir = {
					asc: 'ascending',
					desc: 'descending'
				};
				sort = Ext.decode(p.sort)[0];
				p.sortOn = sort.property;
				p.sortOrder = dir[(sort.direction || 'asc').toLowerCase()] || sort.direction;
				delete p.sort;
			}

			return this.url;
		}

	},


	constructor: function(config) {
		this.proxy = Ext.clone(this.proxy);//get a local instance copy
		this.callParent(arguments);

		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}

		this.on('load', '__onRecordsLoaded');
	},


	__onRecordsLoaded: function(s, records) {
		var me = this,
			loaded;

		//suspend events so we don't update needlessly
		me.suspendEvents();

		loaded = (records || []).map(me.fillInRecord.bind(me));

		Promise.all(loaded)
			.always(function() {
				me.resumeEvents();
				me.fireEvent('refresh');
			});
	},

	/**
	 * Take a record fill in the user and replace its HistoryItemSummary with a shared instance or a placeholder
	 * @param  {Model} record record to fill in
	 */
	fillInRecord: function(record) {
		var assignment = this.getAssignment(),
			user = record.get('User'),
			userId = user && NextThought.model.User.getIdFromRaw(user),
			historyItem = record.get('HistoryItemSummary'),
			grade;

		if (!userId) {
			console.error('No user id found for:', user);
			return;
		}

		if (historyItem) {

			if (historyItem.isModel) {
				grade = historyItem.get('Grade');

				if (!historyItem.get('item')) {
					historyItem.set('item', assignment);
				}
			} else {
				grade = historyItem.Grade;

				if (!historyItem.item) {
					historyItem.item = assignment;
				}
			}

			if (grade) {
				grade = this.GradeCache.getRecord(grade);
			} else {
				grade = this.assignments.createPlaceholderGrade(assignment, userId);
			}



			historyItem = this.HistoryItemCache.getRecord(historyItem);

			historyItem.set('Grade', grade);

			historyItem.collection = this.assignments;

			record.set('HistoryItemSummary', historyItem);
		} else if (assignment) {
			historyItem = this.assignments.createPlaceholderHistoryItem(assignment, userId);

			record.set('HistoryItemSummary', historyItem);
		}

		historyItem.stores.push(record);

		record.set('Grade', historyItem.get('Grade'));


		//Users are added to the cache when the data loads so this should be a no-op
		return UserRepository.getUser(user)
			.then(function(u) {
				record.set({
					'User': u,
					'avatar': u.get('avatarURL'),
					'Username': u.get('Username')
				});
			});
	},


	getAssignment: function() {
		return this.assignments.getFinalGradeAssignment();
	},


	getTotalPages: function() {
		var total = this.getTotalCount(),
			pageSize = this.pageSize;

		return Math.ceil(total / pageSize);
	},


	loadNextPage: function() {
		var current = this.currentPage,
			total = this.getTotalPages();

		if (current < total) {
			this.loadPage(current + 1);
		}
	},


	loadPreviousPage: function() {
		var current = this.currentPage;

		if (current > 1) {
			this.loadPage(current - 1);
		}
	}
});
