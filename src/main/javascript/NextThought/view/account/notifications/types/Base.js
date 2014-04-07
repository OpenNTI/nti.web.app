Ext.define('NextThought.view.account.notifications.types.Base', {

	//the mime type this item renders
	keyVal: '',

	showCreator: true,
	verb: '',
	itemCls: '',

	constructor: function(config) {
		Ext.apply(this, config);
		if (!this.panel) {
			return;
		}

		this.panel.registerSubType(this.keyVal, this.getTpl());
		this.panel.registerFillData(this.keyVal, this.fillInData.bind(this));
		this.panel.registerClickHandler(this.keyVal, this.clicked);
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
						{ tag: 'span', cls: 'creator link', html: '{[this.getName(values)]}'}, ' ',
						{ tag: 'span', cls: 'verb', html: '{[this.getVerb(values)]}'}, ' ',
						{ tag: 'time', cls: 'time', datetime: '{CreatedTime:date("c")}', html: '{CreatedTime:ago()}'}
					]}
				]
			}
		]), {
			getVerb: function(values) {
				return me.getVerb(values);
			},

			getName: function(values) {
				return me.getDisplayName(values);
			},

			getIcon: function(values) {
				return me.getIcon(values);
			}
		});
	},


	getVerb: function() {
		return this.verb;
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
