Ext.define('NextThought.model.courseware.CourseInstance', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.store.courseware.Navigation',
		'NextThought.store.courseware.ToCBasedOutline'
	],

	fields: [
		{ name: 'isCourse', type: 'bool', defaultValue: true, persist: false },
		{ name: 'Discussions', type: 'singleItem', persist: false },
		{ name: 'Outline', type: 'singleItem', persist: false },
		{ name: 'TotalEnrolledCount', type: 'int'},
		{ name: 'Scopes', type: 'auto' }
	],


	asUIData: function() {
		var e = this.getCourseCatalogEntry();

		if (!e) {
			console.warn('CourseCatalogEntry for', this, 'has not been preloaded yet.');
		}

		return {
			id: this.getId(),
			isCourse: true,
			title: (e && e.get('Title')) || 'Missing Catalog Entry',
			label: (e && e.get('ProviderUniqueID')) || '---',
			icon: (e && e.get('thumbnail')) || 'missing-icon.png'
		};
	},


	__precacheEntry: function() {
		var p = this.precachePromise,
			me = this,
			Cls = NextThought.model.courseware.CourseCatalogEntry;

		if (!p) {
			p = this.precachePromise = PromiseFactory.make();

			Cls.load(null, {
				url: me.getLink('CourseCatalogEntry'),
				callback: function(rec) {
					me.__courseCatalogEntry = rec;
					me.afterEdit(['NTIID']);//let views know the record "changed".

					if (rec) {
						p.fulfill(rec);
					} else {
						p.reject('No Record, See logs');
					}
				}
			});
		}

		return p;
	},


	getCourseCatalogEntry: function() {
		return this.__courseCatalogEntry;
	},


	getNavigationStore: function() {
		var temp;
		if (!this.navStore) {
			//This function is wrapping the temporary stop-gap...
			temp = this.__getLocationInfo();
			if (temp && temp.toc) {
				this.navStore = new NextThought.store.courseware.Navigation({
					tocNodes: new NextThought.store.courseware.ToCBasedOutline({data: temp.toc}),
					outlinePromise: this.getOutline()
				});
				this.navStore.courseInstance = this;
			}
		}

		return this.navStore;
	},


	getContentPackageNTIID: function() {
		var c = this.getCourseCatalogEntry();
		return c && c.get('ContentPackageNTIID');
	},


	isExpired: function() {
		var c = this.getCourseCatalogEntry();
		return c && c.isExpired();
	},


	__getLocationInfo: function() {
		var locationInfo = ContentUtils.getLocation(this.getContentPackageNTIID());
		//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
		if (locationInfo) {
			locationInfo.courseInstance = this;
		}

		return locationInfo;
	},


	getPublicScope: function() { return this.getScope('public'); },
	getRestrictedScope: function() { return this.getScope('restricted'); },//i don't think this is used


	getScope: function(scope) {
		var s = (this.get('Scopes') || {})[scope] || '';
		if (typeof s === 'string') {
			s = s.split(' ');
		}
		return s;
	},


	getRoster: function() {
		if (this.__roster) {
			return this.__roster;
		}

		var p = PromiseFactory.make(),
			r = this.getLink('CourseEnrollmentRoster');

		if (!r) {
			p.fulfill(null);
		} else {
			console.time('Getting Roster: ' + r);
			Service.request(r)
					.done(function(txt) {
						console.time('Roster Recieved, Parsing: ' + r);
						var j = Ext.decode(txt, true), map = {};
						j = j && j.Items;
						//filter the active user out of the roster since we are administering this thing.
						j = j && j.filter(function(o) { return o && !isMe(o.Username); });
						j = ParseUtils.parseItems(j);
						if (j) {
							//used in the open/enrolled filters so the filter function doesn't
							// have to search for the username in the roster, can simply get the hash.
							j.forEach(function(i) {
								var n = i.get('Username');
								if (map.hasOwnProperty(n)) {
									console.warn('Replacing key? ' + n);
								}
								map[n] = i;
							});
							//don't modify the array while iterating.
							j.map = map;
						}
						console.timeEnd('Roster Recieved, Parsing: ' + r);
						console.timeEnd('Getting Roster: ' + r);
						p.fulfill(j);
					})
					.fail(function(reason) {
						p.reject(reason);
					});
		}

		this.__roster = p;
		return p;
	},


	getWrapper: function() {
		var p, s = this.stores,
			id = this.getId(), found = false;

		p = new Promise(function(fulfill, reject) {
			s.forEach(function(o) {
				if (o.isModel) {
					fulfill(o);
					found = true;
					return false;
				}
			});
			if (!found) {
				reject('not found');
			}
		});

		if (!found) {
			return CourseWareUtils.resolveCourseInstanceContainer(id);
		}

		return p;
	},


	getOutline: function() {
		//cache outline
		if (!this._outlinePromise) {
			var p = this._outlinePromise = PromiseFactory.make(),
				o = this.get('Outline'),
				me = this;

			o.getContents()
					.fail(function(reason) { p.reject(reason); })
					.done(function() {
						o.navStore = me.getNavigationStore();
						p.fulfill(o);
					});
		}

		return this._outlinePromise;
	},


	getAssignmentHistory: function() {
		var p = PromiseFactory.make(),
			me = this;

		function getLink(rel, e) { return e.getLink(rel) || me.getLink(rel); }

		this.getWrapper()
			.done(function(e) {
				Service.request(getLink('AssignmentHistory', e))
					.done(function(txt) {
						var history = ParseUtils.parseItems(txt)[0];

						p.fulfill(history);
					})
					.fail(function(reason) {
						if ((reason || '').substr(0, 3) === '404') {
							p.fulfill(NextThought.model.courseware.UsersCourseAssignmentHistory.getEmpty());
							return;
						}
						p.reject(reason);
					});
			})
			.fail(function(reason) {
				p.reject(reason);
			});

		return p;
	},


	getAssignments: function() {
		if (this.getAssignmentsPromise) { return this.getAssignmentsPromise; }

		var p = PromiseFactory.make(),
			roster = this.getRoster();
		Promise.pool(
			Service.request(this.getLink('AssignmentsByOutlineNode')),
			Service.request(this.getLink('NonAssignmentAssessmentItemsByOutlineNode'))
		)
			.done(function(json) {
				var assignments = Ext.decode(json[0], true),
					nonAssignments = Ext.decode(json[1], true);
				p.fulfill(NextThought.model.courseware.AssignmentCollection.fromJson(
						assignments, nonAssignments, roster));
			})
			.fail(function(reason) {
				p.reject(reason);
			});

		this.getAssignmentsPromise = p;

		return this.getAssignmentsPromise;
	},


	getGradeBook: function() {
		if (!this._gradebookPromise) {
			var p = this._gradebookPromise = PromiseFactory.make(),
				link = this.getLink('GradeBook');

			if (link) {
				Promise.pool(
					this.getRoster(),
					Service.request(link)
				)
						.done(function(rosterAndjson) {
							var json = rosterAndjson[1];
							json = ParseUtils.parseItems(json)[0];

							p.fulfill(json);
						})
						.fail(function(r) { p.reject(r); });
			} else {
				p.reject('Not present');
			}
		}
		return this._gradebookPromise;
	},


	fireNavigationEvent: function(eventSource, callback) {
		var me = this;

		return this.__precacheEntry()
				.done(function() {
					eventSource.fireEvent('course-selected', me, callback);
				})
				.fail(function(reason) {
					console.error(reason);
				});
	}
});
