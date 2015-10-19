Ext.define('NextThought.app.profiles.components.SuggestedContacts', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-suggested-contacts',

	cls: 'memberships preview users suggested',
	title: 'You May Know...',

	profileRouteRoot: '/user',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{entity:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setEntity: function(entity) {
		var me = this,
			link = entity.getLink('SuggestedContacts');

		if (!link) {
			this.hide();
			return Promise.reject('No suggested contacts link');
		}

		me.removeAll();
		Service.request(link)
			.then(function(responseBody) {
				var json = JSON.parse(responseBody) || {},
					items = json.Items;
				return ParseUtils.parseItems(items);
			})
			.then(function(entities) {
				if (entities.length) {
					entities.slice(0, 4)
						.map(function(entity) {
							return {
								entity: entity,
								name: entity.getName(),
								route: entity.getURLPart()
							};
						})
						.forEach(me.addEntry.bind(me));
				} else {
					me.hide();
				}
			})
			.fail(function() {
				me.hide();
			});
	},

	setUser: function() {
		this.setEntity.apply(this, arguments);
	},


	addEntry: function(data) {
		var entry = Ext.get(this.entryTpl.append(this.entriesEl, data));

		if (data && data.entity) {
			this.mon(data.entity, 'avatarChanged', this.updateAvatar.bind(this, entry));
		}
	},

	getValues: function() {}
});
