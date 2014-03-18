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
		this.panel.registerFillData(this.keyVal, Ext.bind(this.fillInData, this));
		this.panel.registerClickHandler(this.keyVal, this.clicked);
	},

	getTpl: function() {
		//if a sub class has a tpl use that instead
		if (this.tpl) {
			return this.tpl;
		}

		//build the generic tpl
		var verb = this.verb, previewCls = 'preview',
			prev = this.previewField ? '{' + this.previewField + '}' : '',
			creator = this.showCreator ? '{Creator:displayName("You")}' : '';

		if (!this.showCreator) {
			previewCls += ' link';
		}

		if (this.quotePreview) {
			previewCls += ' quote';
		}

		return new Ext.XTemplate(Ext.DomHelper.markup([
			{
				cls: 'history notification ' + this.itemCls,
				cn: [
					{tag: 'span', cls: 'creator link', html: creator},
					{tag: 'span', cls: 'verb', html: verb},
					{tag: 'span', cls: previewCls, html: prev}
				]
			}
		]));
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
