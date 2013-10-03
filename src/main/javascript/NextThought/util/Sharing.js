Ext.define('NextThought.util.Sharing', {
	singleton: true,


	shareWith: function(sharable, people, callback) {
		var sharedTo = Ext.Array.merge(sharable.get('sharedWith') || [], people);
		return this.setSharedWith(sharable, sharedTo, callback);
	},


	setSharedWith: function(sharable, sharedTo, callback) {
		var success = true;

		if ($AppConfig.service.canShare()) {
			sharable.set('sharedWith', sharedTo);
		}
		sharable.save({
						  async: !!callback,
						  callback: function(record, operation) {
							  success = operation.success;//if we're synchronous
							  if (callback) {
								  Ext.callback(callback, null, arguments);
							  }
						  }
					  });

		return success;
	},


	resolveValue: function(value) {
		var result = null;

		//if there are no results yet, fall back to the given value (it may be blank as well)
		result = result || value;

		//if we don't have anything, just return an empty list.
		if (!Ext.isArray(result)) {
			return [];
		}


		//clone the result to make sure we don't mess anything up when modifiying the list.
		result = result.slice();

		Ext.each(result, function(r, i, a) {
			if (ParseUtils.parseNtiid(r)) {
				a[i] = UserRepository.getStore().findRecord('NTIID', r, 0, false, true, true) || r; //HACK!!
				if (!Ext.isString(a[i])) {
					a[i] = a[i].get('Username');
				}
			}
		});


		return result;
	},


	getAppUserCommunities: function() {
		return $AppConfig.userObject.getCommunities(true);
	},

	//TODO need to check published status for the case of blogs NO?
	isPublic: function(sharedWith, pageInfo) {
		if (Ext.isEmpty(sharedWith)) {
			return false;
		}


		var communities = [], sharedWithIds,
				publicScope;

		if (!pageInfo) {
			pageInfo = this.getCurrentPageInfo();
		}

		publicScope = (pageInfo && pageInfo.getPublicScope()) || [];
		sharedWithIds = Ext.Array.map(sharedWith, function(u) {
			return u.getId ? u.getId() : u;
		});

		if (!Ext.isEmpty(publicScope)) {
			return Ext.isEmpty(Ext.Array.difference(publicScope, sharedWithIds));
		}

		Ext.each(this.getAppUserCommunities(), function(rec) {
			communities.push(rec.getId());
		});

		//if communities is a subset of sharedWithIds we call it public
		return Ext.isEmpty(Ext.Array.difference(communities, sharedWithIds));
	},


	getCurrentPageInfo: function() {
		// FIXME: better way to get pageInfo without DQ search?
		var reader = Ext.ComponentQuery.query('reader-content');
		return !Ext.isEmpty(reader) && reader[0].getLocation().pageInfo;
	},

	sharedWithForSharingInfo: function(sharingInfo, pageInfo) {
		if (Ext.isEmpty(sharingInfo)) {
			return [];
		}
		var isPublic = sharingInfo.publicToggleOn,
				entities = sharingInfo.entities || [],
				targets;

		if (!pageInfo) {
			pageInfo = this.getCurrentPageInfo();
		}

		if (isPublic) {
			targets = (pageInfo && pageInfo.getPublicScope()) || [];

			// Use publicScope if defined, otherwise assume public means all communities that a user belongs in.
			if (!Ext.isEmpty(targets)) {
				entities = Ext.Array.merge(entities, targets);
			}
			else {
				Ext.each(this.getAppUserCommunities(), function(rec) {
					entities.push(rec.getId());
				});
			}
		}
		return Ext.Array.unique(entities);
	},


	sharedWithToSharedInfo: function(sharedWith, pageInfo) {
		var pi = pageInfo || this.getCurrentPageInfo(),
				isPublic = this.isPublic(sharedWith, pi),
				communities = [],
				list = [],
				shareInfo = {publicToggleOn: isPublic};

		if (Ext.isEmpty(sharedWith)) {
			shareInfo.entities = [];
			return shareInfo;
		}
		if (!Ext.isArray(sharedWith)) {
			sharedWith = [sharedWith];
		}

		Ext.each(this.getAppUserCommunities(), function(rec) {
			communities.push(rec.getId());
		});

		/**
		 *  NOTE: Since we don't have a good way to map the 'public' property of shared objects, we are following this rule:
		 *  If it's shared with all communities, it is 'public', therefore for the explicit shared list, we will return all entities except communities.
		 *  If it's private however, we will return the 'sharedWith' parameter.
		 */
		if (isPublic) {
			if(pi && Ext.isFunction(pi.getPublicScope)){
				Ext.Array.merge(communities, pi.getPublicScope());
			}
			Ext.each(sharedWith, function(i) {
				if (!Ext.Array.contains(communities, i.getId ? i.getId() : i)) {
					list.push(i);
				}
			});
			shareInfo.entities = list;
			return shareInfo;
		}

		shareInfo.entities = sharedWith.slice();
		return shareInfo;
	},

	getLongSharingDisplayText: function(shareWith, callback, scope, tpl, maxLength) {
		var shareInfo = this.sharedWithToSharedInfo(shareWith),
				explicitEntities = shareInfo.entities,
				isPublic = shareInfo.publicToggleOn,
				prefix, str, others, names = [];

		if (Ext.isEmpty(explicitEntities)) {
			Ext.callback(callback, scope, [isPublic ? 'Public' : 'Only Me']);
		}
		else {
			UserRepository.getUser(explicitEntities, function(resolvedUsers) {
				prefix = isPublic ? 'Public and' : 'Shared with';
				Ext.each(resolvedUsers || [], function(u) {
					var dn = isMe(u) ? 'me' : u.getName();
					names.push(dn);
					names.join(',');
					return !maxLength || names.length <= maxLength;
				});

				if (tpl) {
					names = Ext.Array.map(names, function() { return tpl.apply(arguments); });
				}

				others = resolvedUsers.length - names.length;
				if (others) {
					names.push(Ext.String.format('and {0}.', Ext.util.Format.plural(others, 'other')));
				}
				else if (names.length > 1) {
					names.push(' and ' + names.pop());
				}

				str = Ext.String.format('{0} {1}', prefix, names.join(', '));
				Ext.callback(callback, scope, [str]);
			});
		}

	},

	getShortSharingDisplayText: function(shareWith, callback, scope) {
		var shareInfo = this.sharedWithToSharedInfo(shareWith),
				explicitEntities = shareInfo.entities,
				isPublic = shareInfo.publicToggleOn,
				str;

		if (Ext.isEmpty(explicitEntities)) {
			Ext.callback(callback, scope, [isPublic ? 'Public' : 'Only Me']);
		}
		else if (explicitEntities.length > 1) {
			str = Ext.String.format('{0} {1}', isPublic ? 'Public and'
					: 'Shared with', Ext.util.Format.plural(explicitEntities.length, 'other'));
			Ext.callback(callback, scope, [str]);
		}
		else {
			//Exactly one, resolve the user then callback
			UserRepository.getUser(explicitEntities.first(), function(resolved) {
				var str = Ext.String.format('{0} {1}', isPublic ? 'Public and' : 'Shared with', resolved.getName());
				Ext.callback(callback, scope, [str]);
			});
		}
	}


}, function() {
	window.SharingUtils = this;
});
