Ext.define('NextThought.view.profiles.parts.Achievements', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-achievements',

	requires: [
		'NextThought.view.profiles.parts.BadgeList',
		'NextThought.model.openbadges.Badge'
	],

	uriFriendlyName: 'Achievements',

	columns: 7,

	layout: 'auto',
	ui: 'profile-achievements',
	cls: 'profile-achievements',

	items: [
		{
			xtype: 'container',
			layout: null,
			cls: 'course-badges',
			defaultType: 'profile-badge-list',
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

		this.completedCourses = this.down('[completed]');
		this.currentCourses = this.down('[current]');
		this.achievements = this.down('[achievements]');

		var link = this.user.getLink('Badges'),
			me = this;

		//if its me show the current courses
		if (isMe(this.user)) {
			this.isMe = true;
			this.loadWorkSpace(Service.getWorkspace('Badges'));

			this.completedCourses.hasPublicPreference = true;
		} else {
			this.isMe = false;
			this.currentCourses.destroy();

			if (link) {
				Service.request(link)
					.done(this.loadWorkSpace.bind(this));
			} else {
				this.setEmptyState();
			}
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		if (!this.badgesLoaded) {
			this.el.mask(getString('NextThought.view.profiles.parts.Achievements.loading'));
		}

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
				setWidthInDom: false
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


	getStateData: function() { return this.uriFriendlyName; },

	restore: function(data, callback) {
		Ext.callback(callback, null, [this]);
	},


	loadWorkSpace: function(workspace) {
		var earnableUrl, earnedUrl;

		if (!workspace) {
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

		//we should never have an url for earnable and not earned
		if (earnableUrl && earnedUrl) {
			loadPromise = Promise.all([
				Service.request(earnedUrl),
				Service.request(earnableUrl)
			]);
		} else if (earnedUrl) {
			loadPromise = Service.request(earnedUrl);
		} else {
			me.setEmptyState();
			return;
		}

		loadPromise.done(function(results) {
			if (!Ext.isArray(results)) { results = [results]; }

			var earned = results[0],
				earnable = results[1],
				completed = [],
				current = [],
				achievements = [];

			earnable = earnable && Ext.JSON.decode(earnable, true);
			earned = earned && Ext.JSON.decode(earned, true);

			earnable = (earnable && earnable.Items) || [];
			earned = (earned && earned.Items) || [];

			function isCourse(item) {
				return item.Type === 'Course';
			}

			earned.forEach(function(item) {
				item.earnedCls = 'earned';

				if (isCourse(item)) {
					completed.push(item);
				} else {
					achievements.push(item);
				}
			});

			earnable.forEach(function(item) {
				item.earnedCls = 'earnable';

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
		}).fail(function(reason) {
			console.error(reason);

			//if the request fails and it is me, build the me state with no badges.
			if (me.isMe) {
				me.buildIsMe([], [], []);
			} else {
				me.setEmptyState();
				me.finishLoading();
			}
		});
	},


	finishLoading: function() {
		this.badgesLoaded = true;

		if (this.rendered) {
			this.el.unmask();
		}
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
				cCount = this.columns - iCount;
			} else if (cCount === iCount) {
				cCount = cDesired;
				iCount = iDesired;
			} else {
				cCount = Math.max(this.columns - iCount, cDesired);
				iCount = this.columns - cCount;
			}
		}

		if (achievements.length) {
			this.achievements.bindStore(this.buildStore(achievements));
			this.achievements.setColumns(this.columns);
		} else {
			this.achievements.destroy();
		}

		this.completedCourses.bindStore(this.buildStore(completed));
		this.currentCourses.bindStore(this.buildStore(current));

		this.completedCourses.setColumns(cCount);
		this.currentCourses.setColumns(iCount);

		this.finishLoading();
	},


	buildNotMe: function(completed, achievements) {
		//no badges to show display the empty state
		var me = this;

		if (!completed.length && !achievements.length) {
			me.setEmptyState();

			this.finishLoading();
			return;
		}

		if (!completed.length) {

			if (me.rendered) {
				me.el.down('.course-badges').addCls('empty');
			} else {
				me.on('afterrender', function() {
					me.el.down('.course-badges').addCls('empty');
				});
			}

			this.completedCourses.destroy();
			this.achievements.bindStore(this.buildStore(achievements));
			this.achievements.setColumns(this.columns);

			this.finishLoading();
			return;
		}

		if (!achievements.length) {
			this.achievements.destroy();
			this.completedCourses.bindStore(this.buildStore(completed));
			this.completedCourses.setColumns(this.columns);

			this.finishLoading();
			return;
		}

		this.completedCourses.bindStore(this.buildStore(completed));
		this.achievements.bindStore(this.buildStore(achievements));

		this.completedCourses.setColumns(this.columns);
		this.achievements.setColumns(this.columns);

		this.finishLoading();
	},


	buildStore: function(items) {
		return new Ext.data.Store({
			model: 'NextThought.model.openbadges.Badge',
			data: items
		});
	},


	setEmptyState: function() {
		this.removeAll(true);
		this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-achievements-text', html: getString('NextThought.view.profiles.parts.Achievements.empty')}
		});
	}
});
