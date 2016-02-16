/*globals User, PersistentStorage*/
Ext.define('NextThought.store.courseware.GradeBookSummaries', {
	extend: 'Ext.data.Store',

	model: 'NextThought.model.courses.assignments.Summary',

	remoteSort: true,

	pageSize: 50,
	PAGE_SIZE_KEY: 'summary-page-size',

	proxy: {
		type: 'ajax',
		timeout: 360000, //one hour

		url: 'tbd',

		reader: {
			root: 'Items',
			totalProperty: 'TotalItemCount',

			readRecords: function(resp) {
				var data = this.self.prototype.readRecords.apply(this, arguments),
					list = (data && data.records) || [],
					i = list.length - 1, o, u;

				this.currentPage = resp.BatchPage;
				this.EnrollmentScope = resp.EnrollmentScope;

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

		var size = PersistentStorage.get(this.PAGE_SIZE_KEY);

		if (size) {
			this.pageSize = size;
		}

		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}

		this.on('load', '__onRecordsLoaded');
	},


	setPageSize: function(size) {
		this.pageSize = size;

		PersistentStorage.set(this.PAGE_SIZE_KEY, size);
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
				me.fireEvent('records-filled-in');
			});
	},

	/**
	 * Take a record fill in the user and replace its HistoryItemSummary with a shared instance or a placeholder
	 * @param  {Model} record record to fill in
	 */
	fillInRecord: function(record) {
		var assignment = this.getAssignment(),
			alias = record.get('Alias'),
			username = record.get('Username'),
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
					historyItem.set({
						'item': assignment,
						'AssignmentId': assignment.getId()
					});
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


		//Users are added to the cache when the data loads so this should be a no-op
		return UserRepository.getUser(user)
			.then(function(u) {
				var a = alias || u.getName(),
					name = username || u.get('Username');

				record.set({
					'Alias': a,
					'User': u,
					'avatar': u.get('avatarURL'),
					'Username': name
				});

				return wait();
			});
	},


	getAssignment: function() {
		return this.assignments.getFinalGradeAssignment();
	},


	getCurrentPage: function() {
		return this.proxy.reader.currentPage || 1;
	},


	getEnrollmentScope: function() {
		return this.proxy.reader.EnrollmentScope || 'ForCredit';
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
	},

	//Override this, sorting should only take place
	//from state updating and calling load
	doSort: function() {}
});
