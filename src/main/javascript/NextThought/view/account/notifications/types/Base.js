Ext.define('NextThought.view.account.notifications.types.Base', {

	//the mime type this item renders
	keyVal: '',

	showCreator: true,
	wording: '',
	itemCls: '',

	constructor: function(config) {
		Ext.apply(this, config);

		if (!this.panel) {
			return;
		}

		var panel = this.panel,
			tpl = this.getTpl(),
			fill = this.fillInData.bind(this);
			clicked = this.clicked;

		this.keyVal = Ext.isArray(this.keyVal) ? this.keyVal : [this.keyVal];

		(this.keyVal || []).forEach(function(val) {
			panel.registerSubType(val, tpl);
			panel.registerFillData(val, fill);
			panel.registerClickHandler(val, clicked);
		});

		// this.panel.registerSubType(this.keyVal, this.getTpl());
		// this.panel.registerFillData(this.keyVal, this.fillInData.bind(this));
		// this.panel.registerClickHandler(this.keyVal, this.clicked);
	},

	getTpl: function() {
		//if a sub class has a tpl use that instead
		if (this.tpl) {
			return this.tpl;
		}

		//build the generic tpl
		var me = this,
			previewCls = 'preview';

		if (!me.showCreator) {
			previewCls += ' link';
		}

		return new Ext.XTemplate(Ext.DomHelper.markup([
			{
				cls: 'item notification {hidden:boolStr("x-hidden")} ' + previewCls + ' ' + me.itemCls,
				cn: [
					{ cls: 'icon', style: {backgroundImage: '{[this.getIcon(values)]}'}},
					{ cls: 'wrap', cn: [
						'{[this.getWording(values)]}',
						'{[this.getBody(values)]}',
						{ tag: 'time', cls: 'time',
							datetime: '{[this.getTime(values)]}', html: '{Time:ago()}'}
					]}
				]
			}
		]), {
			getTime: function(values) {
				var t = values.EventTime || values['Last Modified'];
				if (!t || t.getTime() === 0) {
					t = values.CreatedTime;
				}
				values.Time = t;
				return Ext.util.Format.date(t, 'c');
			},

			getWording: function(values) {
				return me.getWording(values);
			},

			getIcon: function(values) {
				if (values.hidden) {
					console.warn('FYI: Item is hidden:', values);
				}
				return me.getIcon(values);
			},

			getBody: function(values) {
				return me.getBody(values);
			}
		});
	},


	getBody: function() {
		return '';
	},


	getBodyTpl: function(body) {
		if (!body) { return ''; }

		return Ext.DomHelper.markup({tag: 'span', cls: 'body', html: body});
	},


	getWording: function(values) {
		if (!this.wording) {
			return '';
		}

		var creator = this.getDisplayNameTpl(values);

		return getFormattedString(this.wording, {
			creator: creator
		});
	},


	getDisplayNameTpl: function(values) {
		var name = this.getDisplayName(values);

		return Ext.DomHelper.markup({tag: 'span', cls: 'creator link', html: name});
	},


	getDisplayName: function(values) {
		if (!values || !this.showCreator) { return ''; }

		return NTIFormat.displayName(values.Creator || values, 'You');
	},

	getIcon: function(values) {
		if (!values || !this.showCreator) { return 'none'; }
		return (values && ('url(' + NTIFormat.avatarURL(values.Creator || values) + ')')) || '';
	},


	fillInData: function(rec) {
		if (!this.showCreator) {return;}

		var u = rec.get('Creator');

		if (!Ext.isString(u)) {
			return;
		}

		if (isMe(u)) {
			rec.set('Creator', $AppConfig.userObject);
		} else {
			UserRepository.getUser(u).then(function(user) {
				rec.set({'Creator': user});
			});
		}
	},

	clicked: function(view, rec) {
		var cid = rec.get('ContainerId');
		view.fireEvent('navigation-selected', cid, rec);
	}
});
