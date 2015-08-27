Ext.define('NextThought.app.profiles.user.components.achievements.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.user-profile-achievements',

	requires: [
		'NextThought.app.profiles.user.components.achievements.parts.BadgeList',
		'NextThought.model.openbadges.Badge'
	],

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	columns: 7,

	layout: 'none',
	ui: 'profile-achievements',
	cls: 'profile-achievements',

	items: [
		{
			xtype: 'container',
			layout: 'none',
			cls: 'course-badges',
			defaultType: 'profile-badge-list',
			courseContainer: true,
			items: [
				{
					header: getString('NextThought.view.profiles.parts.Achievements.current_title'),
					current: true,
					cls: 'current',
					desiredColumns: 3,
					emptyText: getString('NextThought.view.profiles.parts.Achievements.current_empty')
				},
				{
					header: getString('NextThought.view.profiles.parts.Achievements.completed_title'),
					completed: true,
					cls: 'completed',
					desiredColumns: 4,
					hasPublicPreference: true,
					preferencePath: 'Badges/Course',
					preferenceKey: 'show_course_badges',
					preferenceTooltip: getString('NextThought.view.profiles.parts.Achievements.completed_preference'),
					emptyText: getString('NextThought.view.profiles.parts.Achievements.completed_empty')
				}
			]
		},
		{
			xtype: 'profile-badge-list',
			header: getString('NextThought.view.profiles.parts.Achievements.achievements_title'),
			achievements: true,
			cls: 'achievements',
			emptyText: getString('NextThought.view.profiles.parts.Achievements.achievements_empty')
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.addRoute('/', this.showBadges.bind(this));
		this.addDefaultRoute('/');

		this.coursesContainer = this.down('[courseContainer]');
		this.completedCourses = this.down('[completed]');
		this.currentCourses = this.down('[current]');
		this.achievements = this.down('[achievements]');
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.tip = Ext.widget('nt-tooltip', {
			target: me.el,
			delegate: me.completedCourses.itemSelector,
			html: Ext.DomHelper.markup({
				cls: 'tool-tip',
				cn: [
					{tag: 'h2'},
					{tag: 'p'}
				]
			}),
			mouseOffset: [0, 15],
			cls: 'badge-tip x-tip',
			componentLayout: {
				type: 'auto',
				setHeightInDom: false,
				setWidthInDom: false,
				getDockedItems: function() { return []; }
			},
			layout: 'auto',
			anchor: 'bottom',
			tipAnchor: 'b',
			dismissDelay: 0,
			maxWidth: null,
			renderSelectors: {
				header: 'h2',
				description: 'p'
			},
			renderTo: Ext.getBody(),
			listeners: {
				beforeshow: function(tip) {
					var trigger = tip.triggerElement,
						record = trigger && me.getRecord(trigger);

					if (!record) {
						console.error('No badge record to fill out the tool tip with', tip);
						return false;
					}

					this.header.update(record.get('name'));
					this.description.update(record.get('description'));
				}
			}
		});
	},


	getRecord: function(el) {
		var p = Ext.fly(el).parent('.badge-list'),
			cmp = p && Ext.getCmp(p.id);

		return cmp && cmp.getRecord(el);
	},



	userChanged: function(user, isMe) {
		if (this.activeUser === user) {
			return Promise.resolve();
		}

		var link = user.getLink('Badges');

		this.loadingCmp = this.loadingCmp || this.add(Globals.getContainerLoadingMask());

		if (this.emptyText) {
			this.remove(this.emptyText, true);
			delete this.emptyText;
		}

		this.activeUser = user;
		this.isMe = isMe;

		this.coursesContainer.show();
		this.completedCourses.setPublicPreference(isMe);

		this.completedCourses.hide();
		this.currentCourses.hide();
		this.achievements.hide();

		if (isMe) {
			this.loadWorkSpace(Service.getWorkspace('Badges'));
		} else {
			this.currentCourses.hide();

			if (link) {
				Service.request(link)
					.done(this.loadWorkSpace.bind(this));
			} else {
				this.finishLoading();
				this.setEmptyState();
			}
		}


		return Promise.resolve();
	},


	showBadges: function(route, subRoute) {
		this.setTitle('Achievements');

		return Promise.resolve();
	},


	loadWorkSpace: function(workspace) {
		var earnableUrl, earnedUrl;

		if (!workspace) {
			this.finishLoading();
			this.setEmptyState();
			return;
		}

		if (Ext.isString(workspace)) {
			workspace = Ext.JSON.decode(workspace, true);
		}


		(workspace.Items || []).forEach(function(item) {
			if (item.Title === 'EarnableBadges') {
				earnableUrl = item.href;
			} else if (item.Title === 'EarnedBadges') {
				earnedUrl = item.href;
			}
		});


		this.loadBadges(earnableUrl, earnedUrl);
	},


	loadBadges: function(earnableUrl, earnedUrl) {
		var me = this,
			loadPromise;

		function isCourse(item) {
			return item.Type === 'Course';
		}

		//we should never have a url for earnable and not earned
		if (earnableUrl && earnedUrl) {
			loadPromise = Promise.all([
					Service.request(earnedUrl),
					Service.request(earnableUrl)
				]);
		} else if (earnedUrl) {
			loadPromise = Service.request(earnedUrl);
		} else {
			me.finishLoading();
			me.setEmptyState();
			return;
		}

		loadPromise
			.then(function(results) {
				if (!Ext.isArray(results)) { results = [results]; }

				var earned = results[0],
					earnable = results[1],
					completed = [],
					current = [],
					achievements = [];

				earnable = earnable && Ext.JSON.decode(earnable, true);
				earned = earned && Ext.JSON.decode(earned);

				earnable = (earnable && earnable.Items) || [];
				earned = (earned && earned.Items) || [];

				earned.forEach(function(item) {
					item.earnedCls = 'earned';
					item.isMe = me.isMe;

					if (isCourse(item)) {
						completed.push(item);
					} else {
						achievements.push(item);
					}
				});

				earnable.forEach(function(item) {
					item.earnedCls = 'earnable';
					item.isMe = me.isMe;

					if (isCourse(item)) {
						current.push(item);
					} else {
						achievements.push(item);
					}
				});

				if (me.isMe) {
					me.buildIsMe(completed, current, achievements);
				} else {
					me.buildNotMe(completed, achievements);
				}
			})
			.fail(function(reason) {
				console.error(reason);

				//if the request fails and it is me, build the me state with no badges
				if (me.isMe) {
					me.buildIsMe([], [], []);
				} else {
					me.finishLoading();
					me.setEmptyState();
				}
			});
	},


	buildIsMe: function(completed, current, achievements) {
		var cCount = completed.length,
			iCount = current.length,
			aCount = achievements.length,
			cDesired = this.completedCourses.desiredColumns,
			iDesired = this.currentCourses.desiredColumns;

		//if its empty they need the space of 3 columns
		if (cCount === 0) {
			cCount = 3;
		}

		if (iCount === 0) {
			iCount = 3;
		}

		//if we have less than the number of columns
		if ((cCount + iCount) >= this.columns) {
			if (cCount < iCount) {
				iCount = Math.max(this.columns - cCount, iDesired);
			} else if (cCount === iCount) {
				cCount = cDesired;
				iCount = iDesired;
			} else {
				cCount = Math.max(this.columns - iCount, cDesired);
				iCount = this.columns - cCount;
			}
		}

		if (achievements.length) {
			this.achievements.show();
			this.achievements.setColumns(this.columns);
			this.achievements.setItems(achievements);
		} else {
			this.achievements.hide();
		}

		this.completedCourses.show();
		this.completedCourses.setColumns(cCount);
		this.completedCourses.setItems(completed);

		this.currentCourses.show();
		this.currentCourses.setColumns(iCount);
		this.currentCourses.setItems(current);

		this.finishLoading();
	},


	buildNotMe: function(completed, achievements) {
		var me = this;

		function setEmptyCls(add) {
			if (!me.rendered) {
				me.on('afterrender', setEmptyCls.bind(me, show));
			} else {
				me.el.down('.course-badges')[add ? 'addCls' : 'removeCls']('empty');
			}
		}

		//no badges to show, display the empty state
		if (!completed.length && !achievements.length) {
			me.setEmptyState();
			me.finishLoading();
			return;
		}

		if (!completed.length) {
			setEmptyCls(true);

			this.completedCourses.hide();

			this.achievements.show();
			this.achievements.setColumns(this.columns);
			this.achievements.setItems(achievements);
		} else if (!achievements.length) {
			this.achievements.hide();

			setEmptyCls(false);
			this.completedCourses.show();
			this.completedCourses.setColumns(this.columns);
			this.completedCourses.setItems(completed);
		} else {
			setEmptyCls(false);

			this.achievements.show();
			this.achievements.setColumns(this.columns);
			this.achievements.setItems(achievements);

			this.completedCourses.show();
			this.completedCourses.setColumns(this.columns);
			this.completedCourses.setItems(completed);
		}

		this.finishLoading();
	},


	finishLoading: function() {
		if (this.loadingCmp) {
			this.remove(this.loadingCmp, true);
			delete this.loadingCmp;
		}
	},


	setEmptyState: function() {
		this.coursesContainer.hide();
		this.achievements.hide();
		this.currentCourses.hide();
		this.completedCourses.hide();

		this.emptyText = this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-achievements-text', html: getString('NextThought.view.profiles.parts.Achievements.empty')}
		});
	}
});
