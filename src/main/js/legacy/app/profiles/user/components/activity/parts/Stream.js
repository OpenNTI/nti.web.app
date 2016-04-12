const Ext = require('extjs');

require('../../../../../../util/Globals');
require('../../../../../stream/List');
require('./Page');
require('./events/Empty');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.Stream', {
	extend: 'NextThought.app.stream.List',
	alias: 'widget.profile-user-activity-stream',


	userChanged: function (user) {
		var joined;

		this.user = user;
		if (this.hasInitialWidget() && this.rendered) {
			joined = this.down('joined-event');
			if (joined && joined.setUser) {
				joined.setUser(this.user);
			}
		}
	},


	initialWidgetConfig: function () {
		return { xtype: 'joined-event', username: this.user };
	},


	hasInitialWidget: function () {
		return !!this.down('joined-event');
	},


	getPageConfig: function (items) {
		return {
			xtype: 'profile-stream-page',
			records: items,
			user: this.user,
			navigateToObject: this.navigateToObject.bind(this)
		};
	},


	loadBatch: function (batch) {
		if (batch.Items.length) {
			this.removeEmpty();
			this.fillInItems(batch.Items);
		} else if (batch.isFirst && this.getPageCount() === 0) {
			this.onEmpty(batch);
		}

		if (batch.isLast) {
			this.onDone(this.StreamSource);
			this.isOnLastBatch = true;
		}
	},


	onDone: function (streamSource) {
		var config = this.initialWidgetConfig();

		if (this.shouldAddJoinedEvent(streamSource)) {
			if (!this.hasInitialWidget()) {
				this.joinedCmp = this.add(config);
			}
		} else if (this.joinedCmp) {
			this.joinedCmp.destroy();
		}
	},


	onEmpty: function (batch) {
		var cmp = this.getGroupContainer(),
			hasFilters = this.hasFiltersApplied(batch);

		if (!this.emptyCmp) {
			this.emptyCmp = cmp.add({
				xtype: 'profile-activity-part-empty',
				hasFilters: hasFilters
			});
		}
	},


	hasFiltersApplied: function (batch) {
		var s = this.StreamSource;

		if (batch && batch.FilteredTotalItemCount !== batch.TotalItemCount) {
			return true;
		}

		if (!batch && s) {
			return (s.extraParams && s.extraParams.value) || (s.accepts && s.accepts.value) || (s.filters && s.filters.value);
		}

		return false;
	},


	shouldAddJoinedEvent: function (source) {
		var extra = source && source.extraParams,
			createdTime = this.user && this.user.get('CreatedTime'),
			inSeconds = (createdTime && createdTime.getTime()) / 1000;

		if (extra && extra.batchAfter && !isNaN(inSeconds)) {
			return inSeconds > extra.batchAfter;
		}

		if (source.accepts && source.accepts.value) {
			return false;
		}

		return true;
	}
});
