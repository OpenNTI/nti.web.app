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

	isPublic: function(sharedWith){
		/**
		 * 	NOTE: An object is public, if it's shared with all communities that the user belong to.
		 */

		if(Ext.isEmpty(sharedWith)){ return false; }
		var communities = [];
		Ext.each($AppConfig.userObject.getCommunities(true), function(rec){
			communities.push(rec.get('displayName'));
		});

		return Ext.Array.every(communities, function(i){
			return Ext.Array.contains(sharedWith, i);
		});
	},

	resolveExplicitShareTarget: function(sharedWith){
		var isPublic = this.isPublic(sharedWith), c, a,
			communities =[],
			list = [];

		Ext.each($AppConfig.userObject.getCommunities(true), function(rec){
			communities.push(rec.get('displayName'));
		});

		if(Ext.isEmpty(sharedWith)){ return []; }
		if(!Ext.isArray(sharedWith)){ sharedWith = [sharedWith]; }

		/**
		 *  NOTE: Since we don't have a good way to map the 'public' property of shared objects, we are following this rule:
		 *  If it's shared with all communities, it is 'public', therefore for the explicit shared list, we will return all entities except communities.
		 *  If it's private however, we will return the 'sharedWith' parameter.
		 */
		if(isPublic){
			Ext.each(sharedWith, function(i){
				if(!Ext.Array.contains(communities, i)){ list.push(i); }
			});
			return list;
		}

		return sharedWith.slice();
	}

});