Ext.define('NextThought.util.Sharing', {
	singleton: true,


	shareWith: function(sharable, people, callback) {
		var sharedTo = Ext.Array.merge(sharable.get('sharedWith') || [], people);
		return this.setSharedWith(sharable, sharedTo, callback);
	},


	setSharedWith: function(sharable, sharedTo, callback) {
		var success = true;

		if (Service.canShare()) {
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
			if (ParseUtils.isNTIID(r)) {
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
	isPublic: function(sharedWith, scopeProvider) {
		if (Ext.isEmpty(sharedWith)) {
			return false;
		}


		var communities = [], sharedWithIds,
				publicScope;

		if (!scopeProvider) {
			scopeProvider = this.getCurrentSharingInfo();
		}

		publicScope = (scopeProvider && scopeProvider.getPublicScope()) || [];
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


	//Needs the ntiids of the entities in the sharingInfo
	getTagSharingInfo: function(sharingInfo, ntiids) {
		var result, explicitNtiids = ntiids || [],
			isPublic = sharingInfo.publicToggleOn;

		result = {
			tags: [],
			entities: []
		};

		//if the post is public add the ntiids to the tags
		if (isPublic) {
			Ext.each(explicitNtiids, function(u) {
				if (ParseUtils.isNTIID(u)) {
					result.tags.push(u);
				}
			});

			return result;
		}
		//else get the normal sharing info
		result.entities = this.sharedWithForSharingInfo(sharingInfo);

		return result;
	},


	getCurrentSharingInfo: function() {
		return Ext.getCmp('content').currentCourse;
	},

	sharedWithForSharingInfo: function(sharingInfo, scopeProvider) {
		if (Ext.isEmpty(sharingInfo)) {
			return [];
		}
		var isPublic = sharingInfo.publicToggleOn,
				entities = sharingInfo.entities || [],
				targets;

		if (!scopeProvider) {
			scopeProvider = this.getCurrentSharingInfo();
		}

		if (isPublic) {
			targets = (scopeProvider && scopeProvider.getPublicScope()) || [];

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


	sharedWithToSharedInfo: function(sharedWith, scopeProvider) {
		var sp = scopeProvider || this.getCurrentSharingInfo(),
				isPublic = this.isPublic(sharedWith, sp),
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
			if (sp && Ext.isFunction(sp.getPublicScope)) {
				communities = Ext.Array.merge(communities, sp.getPublicScope());
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


	//get the sharedInfo from the sharedWith and the tags
	tagShareToSharedInfo: function(sharedWith, tags, published) {
		var nts = Ext.Array.filter(tags, function(t) {
			return ParseUtils.isNTIID(t);
		});

		//if its not published use the default sharedInfo
		if (!published) {
			return this.sharedWithToSharedInfo(sharedWith);
		}

		//else its published and the ntiids from the tags are the entities
		return {
			publicToggleOn: true,
			entities: nts
		};
	},

	getLongTextFromShareInfo: function(shareInfo, callback, scope, tpl, maxLength) {
		var explicitEntities = shareInfo.entities,
			isPublic = shareInfo.publicToggleOn,
			prefix = isPublic ? 'Public' : 'Only Me',
			str, others, names = [];

		if (Ext.isEmpty(explicitEntities)) {
			Ext.callback(callback, scope, [prefix]);
			return;
		}

		UserRepository.getUser(explicitEntities, function(resolvedUsers) {
			Ext.each(resolvedUsers || [], function(u) {
				var dn = isMe(u) ? 'me' : u.getName();

				if (dn.toLowerCase() !== 'unknown' && !Ext.isEmpty(dn)) {
					names.push(dn);
					return !maxLength || names.length <= maxLength;
				}
			});

			if (tpl) {
				names = Ext.Array.map(names, function() { return tpl.apply(arguments); });
			}

			others = resolvedUsers.length - names.length;

			if (others) {
				names.push(Ext.String.format('and {0}', Ext.util.Format.plural(others, 'other')));
			} else if (names.length > 1) {
				names.push(' and ' + names.pop());
			}

			str = Ext.String.format('{0} {1}', prefix, names.join(','));
			Ext.callback(callback, scope, [str]);
		});

	},

	getShortTextFromShareInfo: function(shareInfo, callback, scope) {
		var explicitEntities = shareInfo.entities,
			isPublic = shareInfo.publicToggleOn,
			prefix = isPublic ? 'Public and' : 'Shared with',
			str;

		if (Ext.isEmpty(explicitEntities)) {
			Ext.callback(callback, scope, [isPublic ? 'Public' : 'Only Me']);
		} else if (explicitEntities.length > 1) {
			str = Ext.String.format('{0} {1}', prefix, Ext.util.Format.plural(explicitEntities.length, 'other'));
			Ext.callback(callback, scope, [str]);
		} else {
			//Exactly one, resolve the user then callback
			UserRepository.getUser(explicitEntities.first(), function(resolved) {
				var dn = resolved.getName();

				if (dn.toLowerCase() === 'unknown' || Ext.isEmpty(dn)) {
					str = Ext.String.format('{0} {1}', prefix, '1 other');
				} else {
					str = Ext.String.format('{0} {1}', prefix, resolved.getName());
				}

				Ext.callback(callback, scope, [str]);
			});
		}
	},

	getLongSharingDisplayText: function(shareWith, callback, scope, tpl, maxLength) {
		var shareInfo = this.sharedWithToSharedInfo(shareWith);

		this.getLongTextFromShareInfo(shareInfo, callback, scope, tpl, maxLength);
	},

	getShortSharingDisplayText: function(shareWith, callback, scope) {
		var shareInfo = this.sharedWithToSharedInfo(shareWith);

		this.getShortTextFromShareInfo(shareInfo, callback, scope);
	},


	//Take the shared with and tags of a post and returns the long sharing text
	getTagSharingLongText: function(sharedWith, tags, published, callback, scope, tpl, maxLength) {
		var shareInfo = this.tagShareToSharedInfo(sharedWith, tags, published);

		this.getLongTextFromShareInfo(shareInfo, callback, scope, tpl, maxLength);
	},

	//Takes the shared with and the tags of a post and returns the short sharing text
	getTagSharingShortText: function(sharedWith, tags, published, callback, scope) {
		var shareInfo = this.tagShareToSharedInfo(sharedWith, tags, published);

		this.getShortTextFromShareInfo(shareInfo, callback, scope);
	}


}, function() {
	window.SharingUtils = this;
});
