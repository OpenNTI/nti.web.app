const Ext = require('@nti/extjs');
const {
	URL: { join: urlJoin },
} = require('@nti/lib-commons');
const { isFlag } = require('@nti/web-client');
const { getString } = require('internal/legacy/util/Localization');
const { getURL } = require('internal/legacy/util/Globals');
const ContentUtils = require('internal/legacy/util/Content');
const CoursewareStream = require('internal/legacy/store/courseware/Stream');
const Navigation = require('internal/legacy/store/courseware/Navigation');
const ObjectUtils = require('internal/legacy/util/Object');
const OutlineInterface = require('internal/legacy/store/courseware/OutlineInterface');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const ToCBasedOutline = require('internal/legacy/store/courseware/ToCBasedOutline');

const AssignmentCollection = require('../courses/AssignmentCollection');
const ForumsBoard = require('../forums/Board');
const QuestionSet = require('../assessment/QuestionSet');
const Timeline = require('../Timeline');
const UsersCourseAssignmentSavepoint = require('../assessment/UsersCourseAssignmentSavepoint');
const UserSearch = require('../UserSearch');
const Video = require('../Video');

const CourseOutline = require('./CourseOutline');

require('internal/legacy/mixins/AuditLog');
require('internal/legacy/mixins/BundleLike');
require('internal/legacy/mixins/DurationCache');
require('internal/legacy/mixins/PresentationResources');
require('../assessment/Assignment');
require('../Base');
require('../ContentBundle');
require('../courseware/GradeBook');
require('../forums/CommunityBoard');
require('../forums/CommunityForum');
require('./AssignmentCollection');
require('./CourseInstanceBoard');
require('./CourseInstanceSharingScopes');
require('./CourseVideoProgress');

const flatten = arr =>
	arr.reduce(
		(acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val),
		[]
	);

const getPropertyIn = (obj, property) =>
	Array.isArray(obj)
		? obj
		: obj && obj.get && getPropertyIn(obj.get(property), property);

const flattenOutlineIn = bundle => {
	const outline = bundle && bundle.get && bundle.get('Outline');
	const nodes =
		outline &&
		outline.OutlineContents &&
		outline.OutlineContents.get('Items');
	if (!(outline && nodes)) {
		return [];
	}

	const items = getPropertyIn(nodes, 'Items');

	return flatten(items);
};

module.exports = exports = Ext.define(
	'NextThought.model.courses.CourseInstance',
	{
		extend: 'NextThought.model.Base',
		isBundle: true,
		isCourse: true,

		mixins: {
			BundleLike: 'NextThought.mixins.BundleLike',
			PresentationResources: 'NextThought.mixins.PresentationResources',
			DurationCache: 'NextThought.mixins.DurationCache',
			auditLog: 'NextThought.mixins.AuditLog',
		},

		fields: [
			{ name: 'AnnouncementForums', type: 'auto' },
			{ name: 'ParentAnnouncementForums', type: 'auto' },
			{
				name: 'Bundle',
				type: 'singleItem',
				mapping: 'ContentPackageBundle',
			},
			{ name: 'Discussions', type: 'singleItem', persist: false },
			{ name: 'ParentDiscussions', type: 'singleItem', persist: false },
			{ name: 'Outline', type: 'singleItem', persist: false },
			{ name: 'GradeBook', type: 'singleItem', persist: false },
			{ name: 'CompletionPolicy', type: 'singleItem', persist: false },

			{ name: 'Scopes', type: 'auto', mapping: 'LegacyScopes' },
			{ name: 'ParentSharingScopes', type: 'singleItem' },
			{ name: 'SharingScopes', type: 'singleItem' },

			{ name: 'TotalEnrolledCount', type: 'int' },
			{
				name: 'TotalEnrolledCountOpen',
				type: 'int',
				mapping: 'TotalLegacyOpenEnrolledCount',
			},
			{
				name: 'TotalEnrolledCountForCredit',
				type: 'int',
				mapping: 'TotalLegacyForCreditEnrolledCount',
			},

			//UI propertied
			{ name: 'Preview', type: 'bool', persist: false },
			{
				name: 'isCourse',
				type: 'bool',
				defaultValue: true,
				persist: false,
			},
			{
				name: 'cover',
				type: 'string',
				persist: false,
				defaultValue: 'missing-notset.png',
			},
			{
				name: 'thumb',
				type: 'string',
				persist: false,
				defaultValue: 'missing.png',
			},
		],

		constructor() {
			this.callParent(arguments);

			this.__precacheEntry();
		},

		getBundle() {
			return this.get('Bundle') || {};
		},

		asUIData() {
			var e = this.getCourseCatalogEntry(),
				bundle =
					(this.getBundle().asUIData &&
						this.getBundle().asUIData()) ||
					{},
				data = {
					id: this.getId(),
					isCourse: true,
					author: e && e.getAuthorLine(),
					title: e && e.get('Title'),
					label: e && e.get('ProviderUniqueID'),
					semester: e && e.getSemesterBadge(),
					archived: e && e.isArchived(),
					upcoming: e && e.isUpcoming(),
					startDate: e && e.get('StartDate'),
				};

			ObjectUtils.clean(bundle);

			bundle = Ext.apply(bundle, data);

			return Ext.applyIf(bundle, {
				icon: e && e.get('icon'),
				thumb: e && e.get('thumb'),
			});
		},

		allowPathSiblings(ntiid) {
			const outline = flattenOutlineIn(this);
			return outline.indexOf(ntiid) > -1;
		},

		getDefaultAssetRoot() {
			var location = this.getLocationInfo(),
				root = location && location.root;

			if (!root) {
				console.error('No location root for course');
				return '';
			}

			return getURL(root).concatPath('/presentation-assets/webapp/v1/');
		},

		setEnrollment(enrollment) {
			this.__instanceEnrollment = enrollment;
		},

		getEnrollment(/*enrollment*/) {
			return this.__instanceEnrollment;
		},

		prepareData() {
			return this.__precacheEntry().then(() => this);
		},

		__precacheEntry() {
			var p = this.precachePromise,
				me = this;

			if (!p) {
				this.precachePromise = this.getWrapper()
					.then(enrollment => {
						const rec = enrollment.getCourseCatalogEntry();

						var outline = me.get('Outline');

						outline.setBundle(me);

						rec.stores.push(me);

						me.__courseCatalogEntry = rec;
						if (rec) {
							rec.get('Links').getRelLink('CourseInstance').href =
								me.get('href');
							me.set('Preview', rec.get('Preview'));
							rec.set('enrolled', true); //if we come from here, we are enrolled.
							me.afterEdit(['NTIID']); //let views know the record "changed".
						}
					})
					.catch(e => console.error(e.stack));

				p = this.precachePromise;
			}

			return p;
		},

		getCourseCatalogEntry() {
			return this.__courseCatalogEntry;
		},

		/**
		 * @returns {CatalogFamily} Get the catalog family for this course
		 */
		getCatalogFamily() {
			return this.__courseCatalogEntry.getCatalogFamily();
		},

		getFirstPage() {
			return this.getBundle()?.getFirstPage?.();
		},

		SCOPE_SUGGESTIONS: {
			ADMIN: {
				order: [
					'Default',
					'Public',
					'Purchased',
					'ForCredit',
					'ForCreditNonDegree',
				],
				keys: {
					Public: ['Public'],
					Purchased: ['Purchased'],
					ForCredit: ['ForCredit'],
					ForCreditNonDegree: ['ForCreditNonDegree'],
				},
				friendlyNames: {
					Default: 'Default Scope',
					Public: getString(
						'sharing-scopes.admin.public',
						'All Students in {sectionName}'
					),
					Purchased: getString(
						'sharing-scopes.admin.purchased',
						'Life Long Learn Students in {sectionName}'
					),
					ForCredit: getString(
						'sharing-scopes.admin.forcredit',
						'For Credit Students in {sectionName}'
					),
					ForCreditNonDegree: getString(
						'sharing-scopes.admin.forcreditnondegree',
						'Five Minute Enrollment Students in {sectionName}'
					),
				},
			},
			STUDENT: {
				order: ['Default'],
				keys: {
					Public: ['Public', 'Purchased'],
					ForCredit: ['ForCredit', 'ForCreditNonDegree'],
				},
				friendlyNames: {
					Default: 'Default Scope',
					Public: getString(
						'sharing-scopes.student.public',
						'All Students in {sectionName}'
					),
					Purchased: getString(
						'sharing-scopes.student.purchased',
						'All Students in {sectionName}'
					),
					ForCredit: getString(
						'sharing-scopes.student.forcredit',
						'For Credit Students in {sectionName}'
					),
					ForCreditNonDegree: getString(
						'sharing-scopes.student.forcreditnondegree',
						'For Credit Students in {sectionName}'
					),
				},
			},
		},

		getSuggestedSharing() {
			return this.getWrapper().then(enrollment => {
				return enrollment.isAdministrative
					? this.getParentSuggestedSharing()
					: this.getStudentSuggestedSharing();
			});
		},

		__scopeToUserSearch(scope, friendlyName) {
			var json = scope.asJSON();

			json.friendlyName = friendlyName || '';

			return UserSearch.create(json);
		},

		getStudentSuggestedSharing() {
			var sectionScopes = this.get('SharingScopes'),
				parentScopes = this.get('ParentSharingScopes') || sectionScopes,
				defaultId = sectionScopes && sectionScopes.getDefaultSharing(),
				defaultScope = sectionScopes && sectionScopes.getDefaultScope(),
				parentPublic = parentScopes && parentScopes.getScope('Public'),
				suggestions = [];

			if (!defaultScope && parentScopes !== sectionScopes) {
				defaultScope = parentScopes.getScopeForId(defaultId);
			}

			if (parentPublic) {
				suggestions.push(
					this.__scopeToUserSearch(parentPublic, 'All Students')
				);
			}

			if (defaultScope && defaultScope !== parentPublic) {
				suggestions.push(
					this.__scopeToUserSearch(defaultScope, 'My Classmates')
				);
			}

			return suggestions;
		},

		getParentSuggestedSharing() {
			var sectionScopes = this.get('SharingScopes'),
				parentScopes = this.get('ParentSharingScopes'),
				containsDefault =
					this.sectionScopes && this.sectionScopes.containsDefault(),
				sectionSuggestions,
				parentSuggestions;

			if (containsDefault) {
				sectionSuggestions = this.__buildSuggestedSharing(
					this.SCOPE_SUGGESTIONS.ADMIN,
					sectionScopes,
					parentScopes ? 'My Section' : 'My Course'
				);
			} else {
				sectionSuggestions = [];
			}

			if (parentScopes) {
				parentSuggestions = this.__buildSuggestedSharing(
					this.SCOPE_SUGGESTIONS.ADMIN,
					parentScopes,
					containsDefault ? 'All Sections' : 'My Course'
				);
			} else {
				parentSuggestions = [];
			}

			return parentSuggestions.concat(sectionSuggestions);
		},

		__buildSuggestedSharing(config, sharingScopes, sectionName) {
			var me = this,
				scopes = {},
				defaultKey,
				items = [],
				defaultSharing = sharingScopes.getDefaultSharing(),
				keys = Object.keys(config.keys);

			keys.forEach(function (key) {
				var names = config.keys[key],
					scope,
					i;

				for (i = 0; i < names.length; i++) {
					scope = sharingScopes.getScope(names[i]);

					if (!scope) {
						continue;
					}

					if (scope.getId() === defaultSharing) {
						scopes[names[i]] = scope;
						defaultKey = names[i];
					}

					if (!scopes[key]) {
						scopes[key] = scope;
					}
				}
			});

			if (defaultKey) {
				scopes['Default'] = scopes[defaultKey];

				delete scopes[defaultKey];

				config.order.forEach(function (name) {
					if (!scopes[name]) {
						return;
					}

					var scopeName = name === 'Default' ? defaultKey : name,
						friendlyName =
							config.friendlyNames &&
							config.friendlyNames[scopeName];

					if (Ext.isString(friendlyName)) {
						friendlyName = friendlyName.replace(
							'{sectionName}',
							sectionName
						);
					}

					items.push(
						me.__scopeToUserSearch(scopes[name], friendlyName)
					);
				});
			}

			return items;
		},

		getContentBreadCrumb(path, pageId, rootId, parent) {
			var root = path[0];

			if (parent) {
				if (root.ntiid === rootId) {
					path.unshift(parent);
				} else {
					path[0] = parent;
				}
			}

			path.forEach(function (part) {
				if (part.ntiid === rootId) {
					part.siblings = [];
				}
			});

			return path;
		},

		//get a count of how many things the user has done in the course
		getCompletionStatus() {},

		getTocFor(contentPackageID) {
			const bundle = this.getBundle();

			return this.getWrapper().then(enrollment => {
				return (
					bundle.getTocFor &&
					bundle.getTocFor(contentPackageID, enrollment.get('Status'))
				);
			});
		},

		getToCs() {
			var bundle = this.getBundle();

			return this.getWrapper().then(enrollment =>
				bundle.getToCs?.(enrollment.get('Status'))
			);
		},

		hasContentPackage(id) {
			return this.getBundle()?.getContentPackage?.(id);
		},

		getContentPackage(id) {
			return this.getBundle()?.getContentPackage?.(id);
		},

		getContentPackageContaining(id) {
			return this.getBundle()?.getContentPackageContaining?.(id);
		},

		syncContentPackage(contentPackage) {
			return this.getBundle()?.syncContentPackage?.(contentPackage);
		},

		async updateContentPackage(id) {
			const contentPackage = await this.getContentPackage(id);

			if (!contentPackage) {
				throw new Error('No Content Package');
			}

			return contentPackage.update(this);
		},

		getContentPackages() {
			return this.getBundle()?.getContentPackages?.();
		},

		getContentRoots() {
			return this.getBundle()?.getContentRoots?.();
		},

		getNonRenderableContentRoots() {
			return this.getBundle()?.getNonRenderableContentRoots?.();
		},

		getContentIds() {
			return this.getBundle()?.getContentIds?.();
		},

		getTitle() {
			return this.getLinkProperty('CourseCatalogEntry', 'title');
		},

		getIcon() {
			return this.getBundle()?.getIcon?.();
		},

		async canGetToContent(ntiid, rootId) {
			const [lineages, locationInfo] = await Promise.all([
				ContentUtils.getLineage(ntiid, this),
				this.getLocationInfo(),
			]);
			const store = this.getNavigationStore();
			let canGetTo = false;

			if (locationInfo) {
				(lineages || []).forEach(lineage => {
					//not in the same content
					if (locationInfo.NTIID !== lineage.last()) {
						canGetTo = true;
					}
				});
			}
			if (this.isExpired()) {
				canGetTo = true;
			}
			// the last item in the lineage is the root of the content.
			// the next to last entry is the first branch from the root
			// of the content (so its a unit or a lesson... if we can
			// find it in the nav store, its available.)
			//TODO: This needs to go away. Favor scoped reader navigation.
			if (!store.getCount()) {
				canGetTo = true;
			}
			if (canGetTo) {
				return true;
			}
			//TODO: Need to simplify logic of this entire canGetToContent function
			lineages?.forEach(lineage => {
				// ick, bad logic testing for the existence of the node in the Outline. (Need LibraryPath for this)
				if (
					store.getById(lineage[Math.max(0, lineage.length - 2)]) ||
					(rootId && lineage.indexOf(rootId) >= 0)
				) {
					//root is in the path of the lineage, we're good to go.
					canGetTo = true;
				}
			});
			return canGetTo;
		},

		canAddAssignment() {
			return !!this.getLink('CourseEvaluations');
		},

		/**
		 * Check is this instance is in the same family as another
		 *
		 * @param  {CourseInstance} instance the instance to compare against
		 * @returns {boolean}		if they are in the same family
		 */
		inSameFamily(instance) {
			const catalog = this.getCourseCatalogEntry();

			return catalog.inSameFamily(instance.getCourseCatalogEntry());
		},

		isExpired() {
			return this.getCourseCatalogEntry()?.isExpired();
		},

		async getLocationInfo() {
			const bundle = this.get('Bundle');

			const enrollment = await this.getWrapper();

			const locationInfo = await bundle?.getLocationInfo(
				enrollment.get('Status')
			);

			if (locationInfo) {
				locationInfo.isCourse = true;
				//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
				locationInfo.courseInstance = this;
			}

			return locationInfo;
		},

		getPresentationProperties(id) {
			return this.getBundle().getPresentationProperties?.(id);
		},

		getAssetRoot() {
			return this.getBundle().getAssetRoot?.();
		},

		async __getPresentationResourcesBacking() {
			const course = await this.prepareData();
			return course.getCourseCatalogEntry();
		},

		/**
		 * Return the a promise that fulfills with the background image of the bundle
		 *
		 * @returns {Promise} fulfills with url
		 */
		async getBackgroundImage() {
			return this.__getPresentationResourcesBacking()
				.then(backing => backing.getBackgroundImage())
				.catch(() => '');
		},

		async getIconImage() {
			return this.__getPresentationResourcesBacking()
				.then(backing => backing.getIconImage())
				.catch(() => '');
		},

		async getThumbnail() {
			return this.__getPresentationResourcesBacking()
				.then(backing => backing.getThumbnail())
				.catch(() => '');
		},

		async getVendorIconImage() {
			return this.__getPresentationResourcesBacking()
				.then(backing => backing.getVendorIcon())
				.catch(() => '');
		},

		getPublicScope() {
			return this.getScope('Public');
		},
		getRestrictedScope() {
			return this.getScope('Restricted');
		},

		//i don't think this is used

		getScope(scope) {
			var s = (this.get('Scopes') || {})[scope.toLowerCase()] || ''; //Old...

			if (typeof s === 'string') {
				s = s.split(' ');
			}
			return s.filter(function (v) {
				return !Ext.isEmpty(v);
			});
		},

		getDefaultSharing() {
			var defaultSharing = this.getPublicScope();

			if (this.raw.SharingScopes) {
				defaultSharing = this.get('SharingScopes').getDefaultSharing();
				defaultSharing = defaultSharing ? [defaultSharing] : [];
			}

			return defaultSharing;
		},

		/**
		 * Return the enrollment instance for this course.
		 *
		 * The enrollment instance should've set itself on the course instance on precache
		 *
		 * Because of how the ParsingUtils work, and since the CourseInstance is a property
		 * on the enrollment instance the enrollment instance should be in the course instance's stores
		 *
		 * @returns {Promise} fulfills with the enrollment instance
		 */
		async getWrapper() {
			//the enrollment instance shouldn't change so we can cache this logic
			if (!this.__findWrapper) {
				this.__findWrapper = new Promise((fulfill, reject) => {
					const enrollment = this.getEnrollment();

					if (enrollment) {
						fulfill(enrollment);
					} else if (this.hasLink('UserCoursePreferredAccess')) {
						Service.request(
							this.getLink('UserCoursePreferredAccess')
						)
							.then(resp => {
								fulfill(
									lazy.ParseUtils.parseItems(
										JSON.parse(resp)
									)[0]
								);
							})
							.catch(reject);
					} else {
						this.stores.forEach(obj => {
							if (obj.isModel) {
								fulfill(obj);
							}
						});
					}
				});
			}

			return this.__findWrapper;
		},

		findOutlineNode(id) {
			return this.get('Outline').findOutlineNode(id);
		},

		getOutlineContents(doNotCache) {
			const outline = this.get('Outline');

			if (!outline) {
				return Promise.resolve(new CourseOutline());
			}

			return outline.getOutlineContents(doNotCache);
		},

		getAdminOutlineContents(doNotCache) {
			return this.get('Outline').getAdminOutlineContents(doNotCache);
		},

		getOutlineInterface(doNotCache) {
			if (!this.OutlineInterface) {
				this.OutlineInterface = new OutlineInterface({
					getOutlineContents: noCache => {
						return this.getOutlineContents(noCache);
					},
					tocPromise: this.__getTocOutline(),
					courseInstance: this,
				});
			} else {
				this.OutlineInterface.updateContents(doNotCache);
			}

			return this.OutlineInterface;
		},

		getAdminOutlineInterface(doNotCache) {
			if (!this.AdminOutlineInterface) {
				this.AdminOutlineInterface = new OutlineInterface({
					getOutlineContents: noCache => {
						return this.getAdminOutlineContents(noCache);
					},
					tocPromise: this.__getTocOutline(),
					courseInstance: this,
				});
			} else {
				this.AdminOutlineInterface.updateContents(doNotCache);
			}

			return this.AdminOutlineInterface;
		},

		hasOutline() {
			var outline = this.get('Outline');

			return outline && outline.hasContentsLink();
		},

		getOutline() {
			//cache outline
			if (!this._outlinePromise) {
				const o = this.get('Outline');

				this._outlinePromise = o.getContents().then(() => {
					o.bundle = this;
					o.navStore = this.getNavigationStore();
					return o;
				});
			}

			return this._outlinePromise;
		},

		/**
		 * Return an outline store based on the first toc,
		 * cache these results for now.
		 * TODO: don't keep these cached for the lifetime of the app
		 *
		 * @returns {[type]} [description]
		 */
		__getTocOutline() {
			if (!this.tocOutline) {
				this.tocOutline = this.getLocationInfo().then(
					location =>
						new ToCBasedOutline({
							data: location?.toc,
						})
				);
			}

			return this.tocOutline;
		},

		getNavigationStore() {
			var key = 'NavStore',
				navStore;

			navStore = this.getFromCache(key);

			if (!navStore) {
				navStore = new Navigation({
					outlineContentsPromise: this.getOutlineContents(),
					tocPromise: this.__getTocOutline(),
				});

				navStore.courseInstance = this;

				this.cacheForShortPeriod(key, navStore);
			}

			return navStore;
		},

		shouldShowAssignments() {
			//we should only show assignments if there is an assignments by outline node link
			return !!this.getLink('AssignmentsByOutlineNode');
		},

		/**
		 * Get the AssignmentHistory link off of the enrolled instance or this
		 *
		 * @returns {string} link to the assignment history
		 */
		async __getAssignmentHistoryLink() {
			const getLink = (rel, e) => e.getLink(rel) || this.getLink(rel);

			const wrapper = await this.getWrapper();
			return getLink('AssignmentHistory', wrapper);
		},

		/**
		 * get the link, and cache the results
		 *
		 * @param  {string} link rel of the link to get
		 * @param  {boolean} force -
		 * @param  {number} timeout -
		 * @returns {Promise} the request for the link
		 */
		__getList(link, force, timeout) {
			var promiseName = '__get' + link + 'Promise';

			if (this[promiseName] && !force) {
				return this[promiseName];
			}

			link = this.getLink(link);

			if (!link) {
				return Promise.reject('No link');
			}

			let config = link;

			if (timeout) {
				config = { url: link, timeout };
			}

			this[promiseName] = Service.request(config).then(function (
				response
			) {
				return Ext.decode(response, true);
			});

			return this[promiseName];
		},

		__getAssignmentsByOutline() {
			return this.__getList(
				'AssignmentSummaryByOutlineNode',
				false,
				60000
			); //up the timeout of the request
		},

		__getNonAssignmentsByOutline() {
			return this.__getList(
				'NonAssignmentAssessmentSummaryItemsByOutlineNode'
			);
		},

		__getGradeBook() {
			if (this.__getGradeBookPromise) {
				return this.__getGradeBookPromise;
			}

			var link = this.getLink('GradeBook');

			//don't reject do it doesn't break the Promise.all
			if (!link) {
				return Promise.resolve(null);
			}

			this.__getGradeBookPromise = Service.request({
				url: link,
				timeout: 120000, //2 minutes
			}).then(function (json) {
				return lazy.ParseUtils.parseItems(json)[0];
			});

			return this.__getGradeBookPromise;
		},

		getAssessmentURL(ntiid) {
			const baseLink = this.getLink('Assessments');

			return baseLink && urlJoin(baseLink, encodeURIComponent(ntiid));
		},

		getInquiriesURL(ntiid) {
			const baseLink = this.getLink('CourseInquiries');

			return baseLink && urlJoin(baseLink, encodeURIComponent(ntiid));
		},

		getLTIConfiguredTools(force) {
			if (this.__getLTIConfiguredToolsPromise && !force) {
				return this.__getLTIConfiguredToolsPromise;
			}

			this.__getLTIConfiguredToolsPromise = this.__getList(
				'lti-configured-tools',
				force
			);

			return this.__getLTIConfiguredToolsPromise;
		},

		hasAssignments() {
			return Boolean(this.__getAssignmentsPromise);
		},

		/**
		 * Return an assignment collection for this course
		 *
		 * @returns {AssignmentCollection} the assignment collection
		 */
		async getAssignments() {
			if (this.__getAssignmentsPromise) {
				return this.__getAssignmentsPromise;
			}

			const gradeBook = this.get('GradeBook');

			this.__getAssignmentsPromise = Promise.all([
				this.getWrapper().catch(() => ({})),
				this.__getAssignmentsByOutline().catch(() => ({})),
				this.__getNonAssignmentsByOutline().catch(() => ({})),
				this.__getAssignmentHistoryLink(),
			]).then(([wrapper, assignments, nonAssignments, historyURL]) =>
				AssignmentCollection.fromJson(
					assignments,
					nonAssignments,
					gradeBook,
					historyURL,
					wrapper.isAdministrative,
					this
				)
			);

			return this.__getAssignmentsPromise;
		},

		getAssignmentSavePoints() {
			var p = this.getAssignmentSavePointsPromise,
				link;

			if (!p) {
				p = this.getWrapper().then(function (cce) {
					link = cce.getLink('AssignmentSavepoints');

					if (link) {
						return Service.request(link)
							.then(function (response) {
								return lazy.ParseUtils.parseItems(response)[0];
							})
							.catch(function () {
								return UsersCourseAssignmentSavepoint.create();
							});
					}

					return Promise.resolve(
						UsersCourseAssignmentSavepoint.create()
					);
				});

				this.getAssignmentSavePointsPromise = p;
			}

			return p;
		},

		getAllSurveys(batchSize, batchStart) {
			var link = this.getLink('Inquiries'),
				config;

			if (!link) {
				return Promise.reject('Survey request failed.');
			}

			config = {
				url: link,
				method: 'GET',
				params: { accept: 'application/vnd.nextthought.nasurvey' },
			};

			if (batchSize) {
				config.params.batchSize = batchSize;
				config.params.batchStart = batchStart || 0;
			}

			//TODO: Add a model for a survey collection. Casper Shepard.
			return Service.request(config).then(function (response) {
				let json = JSON.parse(response);
				let surveys = [];
				json.Items.forEach(function (item) {
					surveys.push(lazy.ParseUtils.parseItems(item)[0]);
				});
				return surveys;
			});
		},

		getAllAssignments() {
			return this.getAssignments().then(function (assignmentsCollection) {
				const assignments = assignmentsCollection.get('Assignments');
				const filtered = (assignments || []).filter(x => !x.isDeleted);
				return filtered;
			});
		},

		getAllAssessments() {
			return this.getAssignments().then(function (assignments) {
				var nonAssignments = assignments.get('NonAssignments');

				return (nonAssignments || []).filter(function (item) {
					return item instanceof QuestionSet;
				});
			});
		},

		fireNavigationEvent(eventSource) {
			var me = this;

			return new Promise(function (fulfill) {
				eventSource.fireEvent('course-selected', me, function () {
					fulfill();
				});
			});
		},

		__getAssets(type, batchSize, batchStart) {
			var link = this.getLink('assets'),
				config;

			if (!link) {
				console.error('No assets link');
				return Promise.resolve([]);
			}

			config = {
				url: link,
				method: 'GET',
				params: {},
			};

			if (type) {
				config.params.accept = type;
			}

			if (batchSize) {
				config.params.batchSize = batchSize;
				config.params.batchStart = batchStart || 0;
			}

			return Service.request(config)
				.then(function (resp) {
					var json = JSON.parse(resp);

					return lazy.ParseUtils.parseItems(json.Items);
				})
				.catch(function (reason) {
					console.error('Failed to load assets: ', reason, type);

					return [];
				});
		},

		getVideoAssets() {
			return this.__getAssets(Video.mimeType);
		},

		getTimelineAssets(batchSize, batchStart) {
			return this.__getAssets(Timeline.mimeType, batchSize, batchStart);
		},

		getDiscussionAssets() {
			var link = this.getLink('CourseDiscussions');

			if (!link) {
				console.error('No discussions link');
				return Promise.resolve([]);
			}

			return Service.request({
				url: link,
				method: 'GET',
			})
				.then(function (resp) {
					var json = JSON.parse(resp),
						items = [];

					for (var k in json.Items) {
						if (json.Items.hasOwnProperty(k)) {
							items.push(json.Items[k]);
						}
					}

					return lazy.ParseUtils.parseItems(items);
				})
				.catch(function (reason) {
					console.error('Failed to load Discussions: ', reason);

					return [];
				});
		},

		getVideosByContentPackage() {
			return this.getBundle().getVideosByContentPackage?.();
		},

		getMediaByOutline(force) {
			return this.__getList('MediaByOutlineNode', force);
		},

		reloadVideoIndex() {
			delete this.videoIndexPromise;

			return this.getVideoIndex(true);
		},

		getVideoIndex(force) {
			if (this.videoIndexPromise) {
				return this.videoIndexPromise;
			}

			this.videoIndexPromise = this.getMediaByOutline(force).then(
				outline => {
					let items = outline.Items;

					// if we have slidedeck, map video obj to their respective slidedeck
					for (let key in items) {
						if (items.hasOwnProperty(key)) {
							let item = items[key] || {};
							if (item.Class === 'NTISlideDeck') {
								Ext.each(item.Videos || [], slidevideo => {
									let vid = slidevideo.video_ntiid;
									if (vid && items[vid]) {
										items[vid].slidedeck = item.NTIID;
									}
								});
							}
						}
					}

					return Promise.resolve(items || {});
				}
			);

			return this.videoIndexPromise;
		},

		getVideoForId(vid) {
			return this.getVideoIndex().then(index => {
				var i = index[vid];
				// Note: Old courses (i.e.Spring 14) don't have the class type but the outline only contains videos.
				// Newer outline contains more that just a video, they include slidedeck...So, for backwards compatibility,
				// to be a video if it has a class it has to be Video, if not, default to video.
				if (i && (i.Class === undefined || i.Class === 'Video')) {
					return Promise.resolve(i);
				}
				return Promise.reject();
			});
		},

		/*
		 * Check if a video belongs to a slidedeck
		 */
		getSlidedeckForVideo(vid) {
			return this.getVideoIndex().then(index => {
				var i = index[vid];
				if (i && i.slidedeck) {
					return Promise.resolve(i.slidedeck);
				}
				return Promise.reject();
			});
		},

		/**
		 *Takes two arrays of forums and bins then
		 *
		 *	1.) by for credit or open
		 *	2.) by if they are for this section or the parent
		 *
		 *returns an object that looks like
		 *{
		 *	ForCredit: {
		 *		Section: [],
		 *		Parent: []
		 *	},
		 *	Open: {
		 *		Section: [],
		 *		Parent: []
		 *	},
		 *	Other: []
		 *}
		 *
		 * @param  {Array} section Array of forums in this section
		 * @param  {Array} parent  Array of forums in the parent if there are any
		 * @returns {Object}		  The binned forums
		 */
		__binDiscussions(section, parent) {
			var bin = {
				ForCredit: {
					Section: [],
					Parent: [],
				},
				Open: {
					Section: [],
					Parent: [],
				},
				Other: {
					Section: [],
					Parent: [],
				},
			};

			function isOpen(item) {
				var title = item.get('title');

				return title.indexOf('Open') === 0;
			}

			function isForCredit(item) {
				var title = item.get('title');

				return title.indexOf('In-Class') === 0;
			}

			(section || []).forEach(function (item) {
				if (isOpen(item)) {
					bin.Open.Section.push(item);
				} else if (isForCredit(item)) {
					bin.ForCredit.Section.push(item);
				} else {
					bin.Other.Section.push(item);
				}
			});

			(parent || []).forEach(function (item) {
				if (isOpen(item)) {
					bin.Open.Parent.push(item);
				} else if (isForCredit(item)) {
					bin.ForCredit.Parent.push(item);
				} else {
					bin.Other.Parent.push(item);
				}
			});

			return bin;
		},

		/**
		 * Takes the binned forums and creates a forum list from it
		 *
		 * Forum lists are an object that look like
		 *	{
		 *		title: 'Title',
		 *		store: contents store of the board,
		 *		children: [forum lists nested beneath this one],
		 *		board: the board associated with this list
		 *	}
		 *
		 * @param  {Object} bin binned forums
		 * @returns {Object}		a forum list of the above type
		 */
		__binToForumList(bin) {
			var section = this.get('Discussions'),
				parent = this.get('ParentDiscussions'),
				sectionId,
				parentId,
				forumList = [],
				forCredit,
				open,
				other;

			sectionId = section && section.getContentsStoreId();
			parentId = parent && parent.getContentsStoreId();

			function isEmpty(b) {
				return Ext.isEmpty(b.Section) && Ext.isEmpty(b.Parent);
			}

			function buildStore(id, data) {
				return ForumsBoard.buildContentsStoreFromData(id, data);
			}

			if (!isEmpty(bin.ForCredit)) {
				forCredit = {
					title: 'Enrolled For-Credit',
					children: [],
				};

				if (!Ext.isEmpty(bin.ForCredit.Section)) {
					forCredit.children.push({
						title: 'My Section',
						store: buildStore(
							sectionId + 'ForCredit',
							bin.ForCredit.Section
						),
						board: section,
					});
				}

				if (!Ext.isEmpty(bin.ForCredit.Parent)) {
					forCredit.children.push({
						title: 'All Sections',
						store: buildStore(
							parentId + 'ForCredit',
							bin.ForCredit.Parent
						),
						board: parent,
					});
				}

				forumList.push(forCredit);
			}

			if (!isEmpty(bin.Open)) {
				open = {
					title: 'Open Discussions',
					children: [],
				};

				if (!Ext.isEmpty(bin.Open.Section)) {
					open.children.push({
						title: 'My Section',
						store: buildStore(sectionId + 'Open', bin.Open.Section),
						board: section,
					});
				}

				if (!Ext.isEmpty(bin.Open.Parent)) {
					open.children.push({
						title: 'All Sections',
						store: buildStore(parentId + 'Open', bin.Open.Parent),
						board: parent,
					});
				}

				forumList.push(open);
			}

			if (!isEmpty(bin.Other)) {
				other = {
					title: 'Other Discussions',
					children: [],
				};

				if (!Ext.isEmpty(bin.Other.Section)) {
					other.children.push({
						title: 'My Section',
						store: buildStore(
							sectionId + 'Other',
							bin.Other.Section
						),
						board: section,
					});
				}

				if (!Ext.isEmpty(bin.Other.Parent)) {
					other.children.push({
						title: 'All Sections',
						store: buildStore(parentId + 'Other', bin.Other.Parent),
						board: parent,
					});
				}

				forumList.push(other);
			}

			if (
				isEmpty(bin.ForCredit) &&
				isEmpty(bin.Open) &&
				isEmpty(bin.Other)
			) {
				forumList.push({
					title: 'Other Discussions',
					children: [
						{
							title: 'My Section',
							store: buildStore(sectionId + 'Other'),
							board: section,
						},
					],
				});
			}

			return forumList;
		},

		/**
		 * Sends requests for the contents link of the discussions and parent discussions if they are there
		 *
		 * @param {string} prop -
		 * @returns {Promise} Fulfills or rejects with the response of the request
		 */
		getDiscussionContents(prop) {
			var board = this.get(prop),
				request;

			if (board) {
				board = board.getLink('contents');

				request = board
					? Service.request(board)
					: Promise.reject('No Contents Link');
			} else {
				request = Promise.reject('No board');
			}

			return request;
		},

		hasForumList() {
			var board = this.get('Discussions'),
				parentBoard = this.get('ParentDiscussions');

			return !!(
				board?.getLink('contents') || parentBoard?.getLink('contents')
			);
		},

		getForumList() {
			var me = this,
				sectionContents,
				parentContents;

			//fail if both section and parent fail to load, succeed otherwise
			return me
				.getDiscussionContents('Discussions')
				.then(function (response) {
					var section;

					if (!response) {
						return Promise.reject('No response');
					}

					try {
						section = JSON.parse(response);

						sectionContents = lazy.ParseUtils.parseItems(
							section.Items
						);
					} catch (e) {
						console.error('Failed to pares section, ', e);

						sectionContents = null;
					}
				})
				.catch(function (reason) {
					console.error('Section contents fail: ', reason);
				})
				.then(me.getDiscussionContents.bind(me, 'ParentDiscussions'))
				.then(function (response) {
					var parent;

					if (!response) {
						return Promise.reject('No response');
					}

					try {
						parent = JSON.parse(response);

						parentContents = lazy.ParseUtils.parseItems(
							parent.Items
						);
					} catch (e) {
						console.error('Failed to parse parent, ', e);

						parentContents = null;
					}
				})
				.catch(function (reason) {
					console.error('Parent contents fail: ', reason);
				})
				.then(function () {
					//bin the forums

					if (!sectionContents && !parentContents) {
						return Promise.reject(
							'Failed to load any board contents'
						);
					}
					return me.__binDiscussions(sectionContents, parentContents);
				})
				.then(me.__binToForumList.bind(me)); //create a forum list for the ui to build from
		},

		containsBoard(id) {
			const discussions = this.get('Discussions');
			const parentDiscussions = this.get('ParentDiscussions');

			return (
				(discussions && discussions.getId() === id) ||
				(parentDiscussions && parentDiscussions.getId() === id)
			);
		},

		represents(catalogEntry) {
			var cceId = catalogEntry.getId(),
				cceHref = catalogEntry.get('href'),
				cce = this.getCourseCatalogEntry();

			return cce
				? cce.getId() === cceId
				: this.getLink('CourseCatalogEntry') === cceHref;
		},

		containsNTIID(id) {
			return (
				this.getBundle().containsNTIID &&
				this.getBundle().containsNTIID(id)
			);
		},

		/**
		 * A helper to parse the object in AnnouncementForums or ParentAnnouncementForums
		 *
		 * @param  {Object} items []
		 * @returns {[type]}		  [description]
		 */
		__getAnnouncementsForums(items) {
			var keys = Object.keys(items) || [],
				forums = [];

			keys.forEach(function (key) {
				var forum = lazy.ParseUtils.parseItems(items[key] || {})[0];

				if (!Ext.isEmpty(forum)) {
					forums.sharingScope = key;
					forums.push(forum);
				}
			});

			return forums;
		},

		/**
		 * AnnouncementForums contain the forums for all the scopes the user is in their section
		 *{
		 *	Items: {
		 *		Public: Forum,
		 *		ForCredit: Forum
		 *	}
		 *}
		 *
		 * @returns {Array} a flattened list of the forums
		 */
		getMySectionAnnouncements() {
			const announcements = this.get('AnnouncementForums')?.Items;

			this.__sectionAnnouncements =
				this.__sectionAnnouncements ||
				this.__getAnnouncementsForums(announcements || {});

			return this.__sectionAnnouncements;
		},

		/**
		 * Same as getMySectionAnnouncements just for my parent section
		 *
		 * @returns {Array} a flattened list of the forums
		 */
		getParentAnnouncements() {
			const announcements = this.get('ParentAnnouncementForums')?.Items;

			this.__parentAnnouncements =
				this.__parentAnnouncements ||
				this.__getAnnouncementsForums(announcements || {});

			return this.__parentAnnouncements;
		},

		getStream() {
			var catalog = this.getCourseCatalogEntry(),
				link = this.getLink('CourseRecursiveStreamByBucket');

			this.__streamStore =
				this.__streamStore ||
				CoursewareStream.create({
					url: link,
					startDate: catalog.get('StartDate'),
				});

			return this.__streamStore;
		},

		getCurrentGrade: async function () {
			const link = this.getLink('CurrentGrade');

			if (!link) {
				throw new Error('No Link');
			}

			return Service.request(link).then(function (response) {
				const json = JSON.parse(response);

				// if there is a FinalGrade, always use that, otherwise
				// defer to PredictedGrade
				const raw = json.FinalGrade || json.PredictedGrade;

				return lazy.ParseUtils.parseItems(raw)[0];
			});
		},

		getVideoProgress() {
			var link = this.getLink('VideoProgress');

			if (!link) {
				return Promise.reject();
			}

			return Service.request(link).then(function (response) {
				return lazy.ParseUtils.parseItems(response)[0];
			});
		},

		getSuggestContacts() {
			if (!isFlag('suggest-contacts') || !this.hasLink('Classmates')) {
				return Promise.reject();
			}

			var link = this.getLink('Classmates');

			return Service.request(link).then(function (response) {
				var parent = JSON.parse(response);
				return lazy.ParseUtils.parseItems(parent.Items);
			});
		},

		getCatalogFamilies() {
			const link = this.getLink('CourseCatalogFamilies');

			if (!link) {
				return Promise.reject();
			}

			return Service.request(link).then(response =>
				lazy.ParseUtils.parseItems(JSON.parse(response).Items)
			);
		},

		getAvailableContentSummary() {
			return this.getInterfaceInstance().then(x =>
				x.getAvailableContentSummary()
			);
		},
	}
);
