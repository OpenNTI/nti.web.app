const Ext = require('extjs');

const {isMe} = require('legacy/util/Globals');

const UserRepository = require('../cache/UserRepository');

const ParseUtils = require('./Parsing');


module.exports = exports = Ext.define('NextThought.util.Sharing', {


	shareWith: function (sharable, people, callback) {
		var sharedTo = Ext.Array.merge(sharable.get('sharedWith') || [], people);
		return this.setSharedWith(sharable, sharedTo, callback);
	},

	canSharePublicly: function () {
		return !!Service.get('SiteCommunity');
	},

	entitiesDefiningPublic: function (/*scopeProvider*/) {
		return null;
	},

	setSharedWith: function (sharable, sharedTo, callback) {
		var success = true;

		if (Service.canShare()) {
			sharable.set('sharedWith', sharedTo);
		}
		sharable.save({
			async: !!callback,
			callback: (record, operation) => {
				success = operation.success;//if we're synchronous
				if (callback) {
					Ext.callback(callback, null, arguments);
				}
			}
		});

		return success;
	},


	resolveValue: function (value) {
		var result = null;

		//if there are no results yet, fall back to the given value (it may be blank as well)
		result = result || value;

		//if we don't have anything, just return an empty list.
		if (!Ext.isArray(result)) {
			return [];
		}


		//clone the result to make sure we don't mess anything up when modifiying the list.
		result = result.slice();

		Ext.each(result, function (r, i, a) {
			if (ParseUtils.isNTIID(r)) {
				a[i] = UserRepository.getStore().findRecord('NTIID', r, 0, false, true, true) || r; //HACK!!
				if (!Ext.isString(a[i])) {
					a[i] = a[i].get('Username');
				}
			}
		});


		return result;
	},


	getAppUserCommunities: function () {
		return $AppConfig.userObject.getCommunities(true);
	},


	//TODO need to check published status for the case of blogs NO?
	isPublic: function (sharedWith, scopeProvider) {
		if (Ext.isEmpty(sharedWith)) {
			return false;
		}


		// let communities = [];
		let sharedWithIds;
		let publicScope;

		publicScope = this.entitiesDefiningPublic(scopeProvider) || [];
		if (Ext.isEmpty(publicScope)) {
			return false;
		}

		sharedWithIds = Ext.Array.map(sharedWith, function (u) {
			return u.getId ? u.getId() : u;
		});

		return Ext.isEmpty(Ext.Array.difference(publicScope, sharedWithIds));
	},


	//Needs the ntiids of the entities in the sharingInfo
	getTagSharingInfo: function (sharingInfo, ntiids) {
		var result, explicitNtiids = ntiids || [],
			isPublic = sharingInfo.publicToggleOn;

		result = {
			tags: [],
			entities: []
		};

		//if the post is public add the ntiids to the tags
		if (isPublic) {
			Ext.each(explicitNtiids, function (u) {
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


	getCurrentSharingInfo: function () {
		return Ext.getCmp('content').currentBundle;
	},


	sharedWithForSharingInfo: function (sharingInfo, scopeProvider) {
		if (Ext.isEmpty(sharingInfo)) {
			return [];
		}
		var isPublic = sharingInfo.publicToggleOn && this.canSharePublicly(),
			entities = sharingInfo.entities || [],
			targets;

		if (isPublic) {
			targets = this.entitiesDefiningPublic(scopeProvider) || [];
			if (!Ext.isEmpty(targets)) {
				entities = Ext.Array.merge(entities, targets);
			}
		}
		return Ext.Array.unique(entities);
	},


	sharedWithToSharedInfo: function (sharedWith, scopeProvider) {
		var sp = scopeProvider,
			isPublic = this.isPublic(sharedWith, sp),
			list = [],
			publicEntities = this.entitiesDefiningPublic(scopeProvider) || [],
			shareInfo = {publicToggleOn: isPublic};

		if (Ext.isEmpty(sharedWith)) {
			shareInfo.entities = [];
			return shareInfo;
		}
		if (!Ext.isArray(sharedWith)) {
			sharedWith = [sharedWith];
		}

		if (isPublic) {
			Ext.each(sharedWith, function (i) {
				if (!Ext.Array.contains(publicEntities, i.getId ? i.getId() : i)) {
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
	tagShareToSharedInfo: function (sharedWith, tags, published) {
		var nts = Ext.Array.filter(tags, function (t) {
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


	getLongTextFromShareInfo: function (shareInfo, tpl, maxLength) {
		var explicitEntities = shareInfo.entities,
			isPublic = shareInfo.publicToggleOn,
			prefix = isPublic && 'Public',
			str, others, suffix, names = [];

		if (Ext.isEmpty(explicitEntities)) {
			return Promise.resolve(prefix || 'Only Me');
		}

		return UserRepository.getUser(explicitEntities)
			.then(function (resolvedUsers) {
				var toResolve = resolvedUsers.length,
					nameMap = {};

				Ext.each(resolvedUsers || [], function (u) {
					var dn;

					if (!u.Unresolved) {
						dn = isMe(u) ? 'me' : u.getName();
					}

					if (!Ext.isEmpty(dn) && dn.toLowerCase() !== 'unknown') {
						names.push(' ' + dn);
						nameMap[names.length - 1] = u;
						return !maxLength || names.length <= maxLength;
					}
				});

				if (tpl) {
					names = Ext.Array.map(names, function (name, idx) {
						var u = nameMap[idx],
							tplArgs = [name, ((u && u.getProfileUrl && u.getProfileUrl()) ? idx : '')];
						return tpl.apply(tplArgs);
					});
				}

				others = toResolve - names.length;
				suffix = '';

				if (others) {
					suffix = Ext.String.format('and {0}', Ext.util.Format.plural(others, 'other'));
				} else if (names.length > 1) {
					suffix = ' and' + names.pop();
				}

				str = Ext.String.format('{0}{1} {2}', prefix || '', names.join(','), suffix);

				return str;
			});
	},


	getShortTextFromShareInfo: function (shareInfo) {
		var explicitEntities = shareInfo.entities,
			isPublic = shareInfo.publicToggleOn,
			prefix = isPublic ? 'Public and' : 'Shared with',
			str;

		if (Ext.isEmpty(explicitEntities)) {
			return Promise.resolve(isPublic ? 'Public' : 'Only Me');
		}

		if (explicitEntities.length > 1) {
			str = Ext.String.format('{0} {1}', prefix, Ext.util.Format.plural(explicitEntities.length, 'other'));

			return Promise.resolve(str);
		}

		//Exactly one, resolve the user then callback
		return UserRepository.getUser(explicitEntities.first())
			.then(function (resolved) {
				var dn = resolved.Unresolved !== true ? resolved.getName() : null;

				if (Ext.isEmpty(dn) || dn.toLowerCase() === 'unknown') {
					str = Ext.String.format('{0} {1}', prefix, '1 other');
				} else {
					str = Ext.String.format('{0} {1}', prefix, resolved.getName());
				}

				return str;
			});
	},


	getLongSharingDisplayText: function (shareWith, callback, scope, tpl, maxLength) {
		var shareInfo = this.sharedWithToSharedInfo(shareWith);

		return this.getLongTextFromShareInfo(shareInfo, tpl, maxLength)
			.then(function (str) {
				if (callback) {
					callback.call(scope, str);
				}

				return str;
			});
	},


	getShortSharingDisplayText: function (shareWith, callback, scope) {
		var shareInfo = this.sharedWithToSharedInfo(shareWith);

		return this.getShortTextFromShareInfo(shareInfo)
			.then(function (str) {
				if (callback) {
					callback.call(scope, str);
				}

				return str;
			});
	},


	//Take the shared with and tags of a post and returns the long sharing text
	getTagSharingLongText: function (sharedWith, tags, published, callback, scope, tpl, maxLength) {
		var shareInfo = this.tagShareToSharedInfo(sharedWith, tags, published);

		return this.getLongTextFromShareInfo(shareInfo, tpl, maxLength)
			.then(function (str) {
				if (callback) {
					callback.call(scope, str);
				}

				return str;
			});
	},


	//Takes the shared with and the tags of a post and returns the short sharing text
	getTagSharingShortText: function (sharedWith, tags, published, callback, scope) {
		var shareInfo = this.tagShareToSharedInfo(sharedWith, tags, published);

		return this.getShortTextFromShareInfo(shareInfo)
			.then(function (str) {
				if (callback) {
					callback.call(scope, str);
				}

				return str;
			});
	}


}).create();
