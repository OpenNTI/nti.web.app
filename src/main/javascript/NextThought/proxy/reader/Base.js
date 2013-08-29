Ext.define('NextThought.proxy.reader.Base', {
	extend:                'Ext.data.reader.Json',
	alias:                 'reader.nti-base',

	//TODO The fact we are doing this may play into why we run into issues
	//with LastModified caching and friends lists.  Need to look into that
	fillCacheWithUserList: function (record, field) {
		var users = (record.raw || {})[field];

		if (!Ext.isEmpty(users)) {
			//console.debug('Need to fill cache with userlist for' , record.getId(), field, users);
			Ext.each(users, function (user) {
				if (user.isModel || Ext.isObject(user)) {
					UserRepository.precacheUser(user);
				}
			});
		}
	},

	precacheUserLists: function (record) {
		var me = this;
		//If we were given a model from the server go ahead and cache it
		//so we don't have to resolve it again.  Failure to do this leads to hundreds
		//of user resolutions (in accounts with lots of data) up front
		record.fields.each(function (f) {
			if (f.type === Ext.data.Types.USERLIST) {
				me.fillCacheWithUserList(record, f.name);
			}
		});
	},

	//Read records and do any prefilling/prefetching of user objects
	readRecords:       function (data) {
		var result = this.callParent([data]),
				records = result.records;
		try {
			Ext.each(records || [], function (record) {
				this.precacheUserLists(record);
			}, this);

			return result;
		}
		catch (e) {
			console.error(e.stack || e, records);
			return Ext.data.ResultSet.create({
												 total:   0,
												 count:   0,
												 records: [],
												 success: false
											 });
		}
	}
});
