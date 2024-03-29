const Ext = require('@nti/extjs');
const UserRepository = require('internal/legacy/cache/UserRepository');
const User = require('internal/legacy/model/User');

module.exports = exports = Ext.define('NextThought.proxy.courseware.Roster', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.nti.roster',

	timeout: 3600000, //hour
	appendId: false,

	headers: {
		Accept: 'application/vnd.nextthought.collection+json',
		'Content-Type': 'application/json',
	},

	reader: {
		totalProperty: data => {
			return data.FilteredTotalItemCount || data.TotalItemCount;
		},
		type: 'json',
		root: 'Items',
		readRecords: function () {
			var data = this.self.prototype.readRecords.apply(this, arguments),
				list = (data && data.records) || [],
				i = list.length - 1,
				o,
				u;

			for (i; i >= 0; i--) {
				o = list[i] && list[i].raw;
				u = o && o.UserProfile;
				if (u) {
					delete o.UserProfile;
					UserRepository.cacheUser(User.create(u, u.Username), true);
				}
			}

			return data;
		},
	},

	noCache: false,

	groupParam: undefined,
	groupDirectionParam: undefined,
	directionParam: undefined,
	pageParam: undefined,

	sortParam: 'sort',
	filterParam: 'filter',
	idParam: undefined, //'batchAround',

	startParam: 'batchStart',
	limitParam: 'batchSize',

	setSource: function (source) {
		//ForCredit, or Open
		this.source = source;
	},

	setURL: function (url) {
		this.url = url;
	},

	buildUrl: function (request) {
		var p = request.params;

		if (Ext.isEmpty(this.url)) {
			Ext.Error.raise('URL required');
		}

		if (p && p.filter) {
			const filters = p.filter;
			delete p.filter;
			Ext.decode(filters).forEach(filter => {
				if (
					filter.property === 'LegacyEnrollmentStatus' &&
					filter.value !== '*'
				) {
					p.filter = filter.property + filter.value;
				} else if (filter.property === 'usernameSearchTerm') {
					p.usernameSearchTerm = filter.value;
				}
			});
		}

		if (p && p.sort) {
			const dir = {
				asc: 'ascending',
				desc: 'descending',
			};
			const sort = Ext.decode(p.sort)[0];
			p.sortOn = sort.property;
			p.sortOrder =
				dir[(sort.direction || 'asc').toLowerCase()] || sort.direction;
			delete p.sort;
		}

		if (this.source === '*') {
			return this.url;
		}

		return Ext.String.urlAppend(
			this.url,
			Ext.Object.toQueryString({
				filter: 'LegacyEnrollmentStatus' + (this.source || 'ForCredit'),
			})
		);
	},
});
