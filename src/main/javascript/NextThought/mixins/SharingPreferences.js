Ext.define('NextThought.mixins.SharingPreferences', {

	getPublished: function(){
		var el = this.cmp.publishEl || this.publishEl;
		return el ? el.is('.on') : undefined;
	},


	computeSharedWithList: function(r){
		/**
		 * @return a union of a sharedList (exclusive entities specified by the user)
		 * plus all communities if it's set to be 'public'.
		 */
		var s = Ext.isArray(r) ? r : [r],
			isPublic = Boolean(this.getPublished()),
			list = [];

		if(isPublic){
			Ext.each($AppConfig.userObject.getCommunities(true), function(c){
				list.push(c.get('Username'));
			});
		}

		return Ext.Array.union(list, s);
	},

	//TODO need to check published status for the case of blogs NO?
	isPublic: function(sharedWith){
		/**
		 * 	NOTE: An object is public, if it's shared with all communities that the user belong to.
		 */

		if(Ext.isEmpty(sharedWith)){ return false; }
		var communities = [], sharedWithIds;

		sharedWithIds = Ext.Array.map(sharedWith, function(u){
			return u.getId ? u.getId() : u;
		});

		Ext.each($AppConfig.userObject.getCommunities(true), function(rec){
			communities.push(rec.getId());
		});

		//if communities is a subset of sharedWithIds we call it public
		return Ext.isEmpty(Ext.Array.difference(communities, sharedWithIds));
	},

	resolveExplicitShareTarget: function(sharedWith){
		var isPublic = this.isPublic(sharedWith),
			sharedWithIds,
			communities =[],
			list = [];

		if(Ext.isEmpty(sharedWith)){ return []; }
		if(!Ext.isArray(sharedWith)){ sharedWith = [sharedWith]; }

		Ext.each($AppConfig.userObject.getCommunities(true), function(rec){
			communities.push(rec.getId());
		});

		/**
		 *  NOTE: Since we don't have a good way to map the 'public' property of shared objects, we are following this rule:
		 *  If it's shared with all communities, it is 'public', therefore for the explicit shared list, we will return all entities except communities.
		 *  If it's private however, we will return the 'sharedWith' parameter.
		 */
		if(isPublic){
			Ext.each(sharedWith, function(i){
				if(!Ext.Array.contains(communities, i.getId ? i.getId() : i)){ list.push(i); }
			});
			return list;
		}

		return sharedWith.slice();
	},

	getLongSharingDisplayText: function(shareWith, callback, scope, tpl, maxLength){
		var isPublic = this.isPublic(shareWith),
			explicitEntities = this.resolveExplicitShareTarget(shareWith),
			prefix, str, others, names = [];

		if(Ext.isEmpty(explicitEntities)){
			Ext.callback(callback, scope, [isPublic ? 'Public' : 'Only Me']);
		}
		else{
			UserRepository.getUser(explicitEntities, function(resolvedUsers){
				prefix = isPublic ? 'Public and' : 'Shared with';
				Ext.Array.each(resolvedUsers || [], function(u){
					var dn = isMe(u) ? 'me' : u.getName();
					names.push(dn);
					names.join(',');
					return maxLength <= 0 || names.length <= maxLength;
				});

				if(tpl){
					names = Ext.Array.map(names,function(){ return tpl.apply(arguments); });
				}

				others = resolvedUsers.length - names.length;
				if(others){
					names.push(Ext.String.format('and {0}.', Ext.util.Format.plural(others.length, 'other')));
				}
				else if(names.length > 1){
					names.push(' and '+names.pop());
				}

				str = Ext.String.format('{0} {1}', prefix, names.join(', '));
				Ext.callback(callback, scope, [str])
			});
		}

	},

	getShortSharingDisplayText: function(shareWith, callback, scope){
		var isPublic = this.isPublic(shareWith),
			explicitEntities = this.resolveExplicitShareTarget(shareWith), str;

		if(Ext.isEmpty(explicitEntities)){
			Ext.callback(callback, scope, [isPublic ? 'Public' : 'Only Me']);
		}
		else if(explicitEntities.length > 1){
			str = Ext.String.format('{0} {1}', isPublic ? 'Public and' : 'Shared with', Ext.util.Format.plural(explicitEntities.length, 'other'));
			Ext.callback(callback, scope, [str]);
		}
		else{
			//Exactly one, resolve the user then callback
			UserRepository.getUser(explicitEntities.first(), function(resolved){
				str = Ext.String.format('{0} {1}', isPublic ? 'Public and' : 'Shared with', resolved.getName());
				Ext.callback(callback, scope, [str])
			});
		}
	}

});