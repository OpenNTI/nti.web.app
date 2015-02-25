/*globals User*/
Ext.define('NextThought.store.courseware.GradeBookSummaries', {
	extend: 'Ext.data.Store',

	remoteSort: true,

	fields: [
		{name: 'Alias', type: 'string'},
		{name: 'Username', type: 'string'},
		{name: 'avatar', type: 'string', defaultValue: User.BLANK_AVATAR},
		{name: 'FinalGrade', type: 'auto'},
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
			totalProperty: 'FilteredTotalItemCount',

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

			if (p && p.filter) {
				Ext.decode(p.filter).forEach(function(filter) {
					if (filter.property === 'LegacyEnrollmentStatus') {
						p.filter = filter.property + filter.value;
					} else if (filter.property === 'usernameSearchTerm') {
						p.usernameSearchTerm = filter.value;
					}
				});
			}

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
		(records || []).forEach(this.__fillInRecord.bind(this));
	},


	__fillInRecord: function(record) {
		var finalGrade = record.get('FinalGrade'),
			user = record.get('User').Username;

		record.set('Username', user);

		if (finalGrade) {
			record.set('FinalGrade', this.GradeCache.getRecord(finalGrade));
		}

		UserRepository.getUser(user)
			.then(function(user) {
				record.set('User', user);

				record.set('avatar', user.get('avatarURL'));
			});
	},


	loadNextPage: function() {
		var current = this.currentPage;

		if (current < 10000) {
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
