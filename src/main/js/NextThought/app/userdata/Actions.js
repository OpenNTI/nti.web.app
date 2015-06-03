Ext.define('NextThought.app.userdata.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.userdata.StateStore',
		'NextThought.app.groups.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.UserDataStore = NextThought.app.userdata.StateStore.getInstance();
		this.GroupsStore = NextThought.app.groups.StateStore.getInstance();
	},


	updatePreferences: function(pageInfo) {
		if (Array.isArray(pageInfo)) {
			pageInfo.map(this.updatePreferences.bind(this));
			return;
		}

		var sharing = pageInfo.get('sharingPreference'),
			pageInfoId = pageInfo.getId(),
			rootId = pageInfo.get('ContentPackageNTIID');

		if (sharing && /inherited/i.test(sharing.State) && rootId === sharing.Provenance) {
			//got a sharing value from the root id, add it to the map
			pageInfoId = rootId;
		} else if (!sharing || (!/set/i.test(sharing.State) && pageInfoId !== rootId)) {
			return;
		}

		this.UserDataStore.setPreference(pageInfoId, {sharing: sharing});

		if (sharing && sharing.sharedWith) {
			// Let's pre-resolve the users that are part of the default sharing list.
			// By the time, we look it up, it should be in the userRepository cache, if it's resolvable.
			userRepository.getUser(sharing.sharedWith);
		}
	},


	__getPreferenceFromLineage: function(ntiids) {
		if (!ntiids) { return Promise.reject('No id to get preference for.'); }

		var store = this.UserDataStore,
			lineage = (ntiids && ntiids[0]) || [],
			preferenceOrPageInfo = lineage.map(function(id) {
				//if we have it cached return that, else call Service.getPageInfo which will get the
				//page info and cache the sharing prefs on this.preferenceMap
				return store.getPreference(id) || Service.getPageInfo.bind(Service, id);
			});

		return Promise.first(preferenceOrPageInfo)
			.then(function(p) {
				if (p.isPageInfo) {
					return store.getPreference[p.getId()] || {sharing: p.get('sharingPreference')};
				}

				return p;
			});
	},


	/**
	 * Returns preferences for the given ntiid.  Currently this functions primary responsibility is
	 * to determine the intial sharedWith list that userdata (new notes) should have the sharedWith list
	 * defaulted to.
	 *
	 * Details on determing a ntiids default sharedWith.  This piggy backs off of the original sharingPreferneces
	 * that the server has long been sending back as part of the PageInfo, with some additional steps/complications
	 * to make the sharing default to something sane(?) for both open and for credit students when in the context
	 * of a course.
	 *
	 * The current business logic is as follows.  In the context of a book use whatever the content default is,
	 * or whatever the user has overriden it to.  For a course, students enrolled for credit should default to
	 * the for credit dfl unless they have changed the default.  In courses, open users default to whatever public means for that
	 * course unless they have changed the default..  I don't think this business logic will make sense at even
	 * the next step forward in formalizing CourseInstances so we should revist both the current business logic and implementation
	 * at that point in time.
	 *
	 * Meeting the business case for the books and content is currently done using the same implementation.
	 * This is possible because we piggy back on some of the implementation details of how the communities and dfls are setup
	 * for legacy community based courses.  Obviously this level of coupling to implementation details is extermely fragile.
	 * This is one place where moving things further into the server can help immensly.  That will come with time.
	 *
	 * We start with the sharingPreferences, which by default for course content packages are configured to be the for credit dfl.
	 * Given the list of default entites we then attempt to validate it.  The list of entities is valid iff we can resolve all
	 * usernames/ntiids in it to Entities (users, friendslists, dfls, or communities) AND entites that are friendslists, dfls, or communities
	 * are in our set of friendslists, dfls, communities we own or are a member of.  If the sharedWith list is found to be valid, we use it
	 * as is.  If the default sharing entites are found to be invalid or if we never found the default sharingPreferences to begin with,
	 * we default to whatever 'public' means for the 'title' this ntiid belong to.  Note: this last detail also has assumptions
	 * baked in around one content package per course, and the lack of cross content/course references.  When we have courses
	 * references books external to their content package this will break.
	 *
	 *
	 * @param {String} ntiid
	 * @return {Object} An object encasuplating the prefences for the given ntiid.  Sharing related preferences are found beneath
	 * the 'sharing' key
	 */
	 getPreferences: function(ntiid, bundle) {
	 	if (!ntiid) {
	 		return Promise.reject('No id.');
	 	}

	 	var flStore = this.GroupsStore.getFriendsList();

	 	return ContentUtils.getLineage(ntiid, bundle)
	 		.then(this.__getPreferenceFromLineage.bind(this))
	 		.then(function(result) {
	 			var sharingIsValid = result && !Ext.isEmpty(result.sharing);

	 			if (sharingIsValid) {
	 				(result.sharing.sharedWith || []).every(function(id) {
	 					var entity = UserRepository.resolveFromStore(id),
	 						found;

	 					if (!entity) {
	 						sharingIsValid = false;
	 					} else {
	 						//If its not a user its a fl, or dfl we have to have it in
							//the fl store.  If its a community it would need to be in  our
							//community list
							if (entitiy.isFriendsList) {
								if (!flStore.getById(entity.getId())) {
									sharingIsValid = false;
								}
							} else if (entity.isCommunity) {
								found = false;
								$AppConfig.userObject.getCommunities().every(function(com) {
									if (com.getId() === entity.getId()) {
										found = true;
									}

									return !found;
								});

								sharingIsValid = found;
							}
	 					}

	 					return sharingIsValid;
	 				});
	 			}

	 			if (!result || !sharingIsValid) {
	 				// if we have no sharing prefs, default to the public scope
					// or we can't resolve the sharing, the use public scope.
					return Promise[bundle ? 'resolve' : 'reject'](bundle)
						.then(function(ci) {
							return {sharing: {shareWith: ci.getDefaultSharing()}};
						})
						.fail(function() {
							return {sharing: {}};
						});
	 			}

	 			return result;
	 		});
	 }
});
