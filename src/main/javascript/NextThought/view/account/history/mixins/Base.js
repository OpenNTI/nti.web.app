Ext.define('NextThought.view.account.history.mixins.Base', {
	alias: 'widget.history-item-base',

	//the mime type this item renders
	keyVal: '',

	showCreator: true,
	verb: '',
	previewField: '',
	quotePreview: true,
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
			previewCls = 'preview',
			prev = me.previewField ? '{' + me.previewField + '}' : '',
			creator = me.showCreator ? '{Creator:displayName("You")}' : '';

		if (!me.showCreator) {
			previewCls += ' link';
		}

		if (me.quotePreview) {
			previewCls += ' quote';
		}

		return new Ext.XTemplate(Ext.DomHelper.markup([
			{
				cls: 'history notification {hidden:boolStr("x-hidden")} ' + me.itemCls,
				cn: [
					{tag: 'span', cls: 'creator link', html: creator},
					{tag: 'span', cls: 'verb', html: '{[this.getVerb(values)]}'},
					{tag: 'span', cls: previewCls, html: prev}
				]
			}
		]), {
			getVerb: function(values) {
				return me.getVerb(values);
			}
		});
	},


	getVerb: function() {
		return this.verb;
	},


	fillInData: function(rec) {
		var u = rec.get('Creator');

		if (isMe(u)) {
			rec.set('Creator', $AppConfig.userObject);
		} else {
			UserRepository.getUser(u, function(user) {
				rec.set({'Creator': user});
			});
		}
	},

	clicked: function(view, rec) {
		var cid = rec.get('ContainerId');

		view.fireEvent('navigation-selected', cid, rec);
	}
});
