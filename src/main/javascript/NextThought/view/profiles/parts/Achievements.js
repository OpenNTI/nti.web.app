Ext.define('NextThought.view.profiles.parts.Achievements', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-achievements',

	requires: ['NextThought.view.profiles.parts.BadgeList'],

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
					header: 'Current Courses',
					current: true,
					cls: 'current',
					desiredColumns: 3,
					emptyText: 'You are currently not enrolled in any courses that offer a completion badge.'
				},
				{
					header: 'Completed',
					completed: true,
					cls: 'completed',
					desiredColumns: 4,
					preferencePath: 'Badges/Course',
					preferenceKey: 'show_course_badges',
					emptyText: 'You haven\'t completed a course that offers a completion badge.'
				}
			]
		},
		{
			xtype: 'profile-badge-list',
			header: 'Achievements',
			achievements: true,
			cls: 'achievements',
			emptyText: 'You haven\'t earned any achievement badges yet. The more you use the app and actively participate the more you will earn.'
		}
	],

	initComponent: function() {
		this.callParent(arguments);

		this.completedCourses = this.down('[completed]');
		this.currentCourses = this.down('[current]');
		this.achievements = this.down('[achievements]');

		var link = this.user.getLink('Badges');

		//if its me show the current courses
		if (isMe(this.user)) {
			this.isMe = true;
			this.loadWorkSpace(Service.getWorkspace('Badges'));

			this.completedCourses.hasPublicPreference = true;
		} else {
			this.isMe = false;
			this.currentCourses.destroy();

			this.completedCourses.emptyText = 'This user hasn\'t completed a course that offers a completion badge.';

			if (link) {
				Service.request(link)
					.done(this.loadWorkSpace.bind(this));
			} else {
				this.setEmptyState();
			}
		}
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

			function fillIn(item) {
				if (!item.name) {
					item.name = item.description;
				}

				return item;
			}

			function isCourse(item) {
				return item.Type === 'Course';
			}

			earned.forEach(function(item) {
				item.earnedCls = 'earned';

				item = fillIn(item);

				if (isCourse(item)) {
					completed.push(item);
				} else {
					achievements.push(item);
				}
			});

			earnable.forEach(function(item) {
				item.earnedCls = 'earnable';

				item = fillIn(item);

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
	},


	buildNotMe: function(completed, achievements) {
		//no badges to show display the empty state
		var me = this;

		if (!completed.length && !achievements.length) {
			me.setEmptyState();
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
			return;
		}

		if (!achievements.length) {
			this.achievements.destroy();
			this.completedCourses.bindStore(this.buildStore(completed));
			this.completedCourses.setColumns(this.columns);
			return;
		}

		this.completedCourses.bindStore(this.buildStore(completed));
		this.achievements.bindStore(this.buildStore(achievements));

		this.completedCourses.setColumns(this.columns);
		this.achievements.setColumns(this.columns);
	},


	buildStore: function(items) {
		return new Ext.data.Store({
			fields: [
				{name: 'NTIID', type: 'string'},
				{name: 'criteria', type: 'string'},
				{name: 'description', type: 'string'},
				{name: 'href', type: 'string'},
				{name: 'image', type: 'string'},
				{name: 'issuer', type: 'auto'},
				{name: 'tags', type: 'auto'},
				{name: 'name', type: 'string'},
				{name: 'earnedCls', type: 'string'}
			],
			data: items
		});
	},


	setEmptyState: function() {
		this.removeAll(true);
		this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-achievements-text', html: 'This user doesn\'t have any visible badges.'}
		});
	}
});
