Ext.define('NextThought.app.notifications.components.types.Base', {
	extend: 'Ext.Component',

	//the mime type this item renders
	statics: {
		keyVal: ''
	},

	showCreator: true,
	wording: '',
	itemCls: '',

	titleTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'title', html: '{name}'}).compile(),

	renderTpl: Ext.DomHelper.markup({
		cls: 'item notification {hidden:boolStr("x-hidden")} {previewCls} {itemCls}',
		cn: [
			{cls: 'icon-wrapper'},
			{cls: 'username'},
			{tag: 'span', cls: 'wrapper', cn: [
				{tag: 'span', cls: 'wording'},
				{tag: 'time', cls: 'time', datetime: '{datetime}', html: '{time:ago()}'}
			]}
		]
	}),


	renderSelectors: {
		itemEl: '.item',
		iconEl: '.icon-wrapper',
		usernameEl: '.username',
		wordingEl: '.wording',
		bodyEl: '.body',
		timeEl: '.time'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var time = this.getDisplayTime();

		this.renderData = Ext.apply(this.renderData || {}, {
			hidden: false,
			previewCls: this.showCreator ? 'preview' : 'link',
			itemCls: this.itemCls,
			datetime: Ext.util.Format.date(time, 'c'),
			time: time
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.fillInData();
		this.fillInWording();
	},


	fillInData: function() {
		var me = this,
			creator = me.item.get('Creator');

		UserRepository.getUser(creator)
			.then(function(user) {
				me.iconEl.update(NTIFormat.avatar(user));
				me.usernameEl.update(user.getName());
			});
	},


	fillInWording: function() {
		this.wordingEl.dom.innerHTML = this.wording;
	},


	getDisplayTime: function() {
		var time = this.item.get('Last Modified');

		if (!time || time.getTime() === 0) {
			time = this.item.get('CreatedTime');
		}

		return time;
	}
});

// Ext.define('NextThought.app.notifications.components.types.Base', {

// 	requires: ['NextThought.app.library.Actions'],

// 	//the mime type this item renders
// 	keyVal: '',

// 	showCreator: true,
// 	wording: '',
// 	itemCls: '',

// 	constructor: function(config) {
// 		Ext.apply(this, config);

// 		if (!this.panel) {
// 			return;
// 		}

// 		var panel = this.panel,
// 			tpl = this.getTpl(),
// 			fill = this.fillInData.bind(this);
// 			clicked = this.clicked;

// 		this.keyVal = Ext.isArray(this.keyVal) ? this.keyVal : [this.keyVal];

// 		(this.keyVal || []).forEach(function(val) {
// 			panel.registerSubType(val, tpl);
// 			panel.registerFillData(val, fill);
// 			panel.registerClickHandler(val, clicked);
// 		});

// 		this.LibraryActions = NextThought.app.library.Actions.create();

// 		// this.panel.registerSubType(this.keyVal, this.getTpl());
// 		// this.panel.registerFillData(this.keyVal, this.fillInData.bind(this));
// 		// this.panel.registerClickHandler(this.keyVal, this.clicked);
// 	},

// 	getTpl: function() {
// 		//if a sub class has a tpl use that instead
// 		if (this.tpl) {
// 			return this.tpl;
// 		}

// 		//build the generic tpl
// 		var me = this,
// 			previewCls = 'preview';

// 		if (!me.showCreator) {
// 			previewCls += ' link';
// 		}

// 		return new Ext.XTemplate(Ext.DomHelper.markup([
// 			{
// 				cls: 'item notification {hidden:boolStr("x-hidden")} ' + previewCls + ' ' + me.itemCls,
// 				cn: [
// 					'{[this.getIcon(values)]}',
// 					{ cls: 'wrap', cn: [
// 						'{[this.getWording(values)]}',
// 						'{[this.getBody(values)]}',
// 						{ tag: 'time', cls: 'time',
// 							datetime: '{[this.getTime(values)]}', html: '{Time:ago()}'}
// 					]}
// 				]
// 			}
// 		]), {
// 			getTime: function(values) {
// 				if (me.getDisplayTime) { return me.getDisplayTime(values); }

// 				var t = values.CreatedTime;

// 				values.Time = t;
// 				return Ext.util.Format.date(t, 'c');
// 			},

// 			getWording: function(values) {
// 				return me.getWording(values);
// 			},

// 			getIcon: function(values) {
// 				if (values.hidden) {
// 					console.warn('FYI: Item is hidden:', values);
// 				}
// 				return me.getIcon(values);
// 			},

// 			getBody: function(values) {
// 				return me.getBody(values);
// 			}
// 		});
// 	},


// 	getBody: function() {
// 		return '';
// 	},


// 	getBodyTpl: function(body) {
// 		if (!body) { return ''; }

// 		return Ext.DomHelper.markup({tag: 'span', cls: 'body', html: body});
// 	},


// 	getWording: function(values) {
// 		if (!this.wording) {
// 			return '';
// 		}

// 		var creator = this.getDisplayNameTpl(values);

// 		return getFormattedString(this.wording, {
// 			creator: creator
// 		});
// 	},


// 	getDisplayNameTpl: function(values) {
// 		var name = this.getDisplayName(values);

// 		return Ext.DomHelper.markup({tag: 'span', cls: 'creator link', html: name});
// 	},


// 	getDisplayName: function(values) {
// 		if (!values || !this.showCreator) { return ''; }

// 		return NTIFormat.displayName(values.Creator || values, 'You');
// 	},

// 	getIcon: function(values) {
// 		if (!values || !this.showCreator) { return ''; }

// 		return NTIFormat.avatar(values.Creator || values);
// 	},


// 	fillInData: function(rec) {
// 		if (!this.showCreator) {return;}

// 		var u = rec.get('Creator');

// 		if (!Ext.isString(u)) {
// 			return;
// 		}

// 		if (isMe(u)) {
// 			rec.set('Creator', $AppConfig.userObject);
// 		} else {
// 			UserRepository.getUser(u).then(function(user) {
// 				rec.set({'Creator': user});
// 			});
// 		}
// 	},

// 	clicked: function(view, rec) {
// 		//TODO: figure out how to do this
// 	}
// });
