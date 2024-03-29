const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('../user/components/membership/parts/Membership');

module.exports = exports = Ext.define(
	'NextThought.app.profiles.components.SuggestedContacts',
	{
		extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
		alias: 'widget.profile-suggested-contacts',

		cls: 'memberships preview users suggested',
		title: 'You May Know...',

		profileRouteRoot: '/user',

		entryTpl: new Ext.XTemplate(
			Ext.DomHelper.markup({
				cls: 'entry',
				'data-route': '{route}',
				cn: ['{entity:avatar}', { cls: 'name', html: '{name}' }],
			})
		),

		setEntity: function (entity) {
			var me = this,
				link = entity.getLink('SuggestedContacts');

			if (!link) {
				this.hide();
				return Promise.reject('No suggested contacts link');
			}

			me.removeAll();
			Service.request(link)
				.then(function (responseBody) {
					var json = JSON.parse(responseBody) || {},
						items = json.Items;
					return lazy.ParseUtils.parseItems(items);
				})
				.then(function (entities) {
					if (entities.length) {
						entities
							.slice(0, 4)
							.map(e => ({
								entity: e,
								name: e.getName(),
								route: e.getURLPart(),
							}))
							.forEach(me.addEntry.bind(me));
					} else {
						me.hide();
					}
				})
				.catch(function () {
					me.hide();
				});
		},

		setUser: function () {
			this.setEntity.apply(this, arguments);
		},

		addEntry: function (data) {
			var entry = Ext.get(this.entryTpl.append(this.entriesEl, data));

			if (data && data.entity) {
				this.mon(
					data.entity,
					'avatarChanged',
					this.updateAvatar.bind(this, entry)
				);
			}
		},

		getValues: function () {},
	}
);
