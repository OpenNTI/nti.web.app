Ext.define('NextThought.view.account.coppa.upgraded.Confirm', {
	extend: 'Ext.Component',
	alias: 'widget.coppa-birthday-form',

	requires:[
		'NextThought.view.account.coppa.upgraded.MonthPicker'
	],

	cls: 'coppa-form',

	renderTpl: Ext.DomHelper.markup([{
		cls:'birthday', cn: [
			{cls:'legend', html:'When is your birthday?'},
			{cls:'fields', cn:[
				{cls:'month selectbox', 'data-required': true, value:'', html:'Month'},
				{tag:'input', type: 'text', 'data-required': true, placeholder: 'Day', name: 'day', size:'2'},
				{tag:'input', type: 'text', 'data-required': true, placeholder: 'Year', name: 'year', size:'3'},
				{cls:'continue', html:'Continue'}
			]}
		]},{
		cls:'account-info', cn:[
			{cls:'legend', html: 'Account Information'},
			{cls:'fields', cn:[
				{tag:'input', type: 'text', cls:'hidden', 'data-required': true, placeholder: 'First Name', name: 'first', size:'4'},
				{tag:'input', type: 'text', cls:'hidden', placeholder: 'Last Name', name: 'last', size:'4'},
				{tag:'input', type: 'text', cls:'hidden', 'data-required': true, placeholder: 'Your Email', name: 'email', size:'5'},
				{tag:'input', type: 'text', cls:'hidden', 'data-required': true, placeholder: 'Parent\'s Email', name: 'contact_email', size:'5'}
			]},
			{cls:'save', html:'Save Changes'}
		]}
	]),

	renderSelectors:{
		monthEl:'.month',
		accountInfoEl:'.account-info',
		continueEl: '.continue',
		saveEl: '.save'
	},

	afterRender: function(){
		this.callParent(arguments);

		var me = this;
		this.accountInfoEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.accountInfoEl.hide();
		this.monthPickerView = Ext.widget('month-picker');
		this.mon(this.monthEl, 'click', this.showMonthPicker, this);
		this.mon(this.monthPickerView, 'select', this.onSelectedItem, this);
		this.mon(this.continueEl, 'click', this.submitBirthday, this);
		this.mon(this.saveEl, 'click', this.save, this);

		this.fieldsChannel = {
			'birthdate': this.getBirthdayValue,
			'realname': this.getRealName,
			'contact_email': function(){ return me.el.down('[name=contact_email]').getValue(); },
			'email': function(){ return me.el.down('[name=email]').getValue(); }
		};

		this.monthPickerView.show().hide();
	},


	save: function(){
		var params = {}, i, me = this, url, req, v, canSave = true, p;

		for(i in me.schema){
			if(me.schema.hasOwnProperty(i)){
				v = me.fieldsChannel[i].call(me);

				//Need to do a better validation job.
				if(Ext.isEmpty(v)){
					console.warn('required field ', i, 'is empty!');
					canSave = false;
				}
				params[i] = v;
			}
		}

		if(!canSave){ return; }

		url = this.getLink('upgrade_coppa_user');
		req = {
			url: url,
			params: JSON.stringify(params),
			method: 'POST',
			success: function(r, opts){
				console.log('SUCCESS Account Upgraded: ', arguments);

				//Now we can delete this window.
				p = me.up('coppa-confirm-window');

				Ext.defer(p.destroy, 1, me);

			},
			failure: function(){ console.log('FAIL: ', arguments)}
		};

		Ext.Ajax.request(req);
	},


	getRealName: function(){
		var f = this.el.down('[name=first]').getValue(),
			l = this.el.down('[name=last]').getValue();
		return f+' '+l;
	},


	submitBirthday: function(){
		var bd = this.getBirthdayValue();
		if(Ext.isEmpty(bd)){ return;}

		this.preflight({'birthdate':bd}, this.showSchemaFields);
		this.continueEl.update('Thanks!');
		this.continueEl.addCls('submitted');
	},


	getBirthdayValue: function(){
		function isValidBirthday(){
			return (bd && !isNaN(bd.getTime()) && bd.getFullYear() === y && bd.getMonth() === m && bd.getDate() === d);
		}
		function invalidate(){
			me.el.down('.birthday').removeCls('valid').addCls('invalid');
			console.warn('Invalid birthday...');
		}


		var m = this.monthEl.getAttribute('data-value'),
			d = this.el.down('[name=day]').getValue(),
			y = this.el.down('[name=year]').getValue(),
			bd, me = this;

		m = parseInt(m);
		d = parseInt(d);
		y = parseInt(y);

		bd = new Date(y<1000?NaN:y, m, d);
		if(isValidBirthday()){
			return bd;
		}

		invalidate();
		return null;
	},


	preflight: function(params, successCallBack, failCallBack){
		function fail(){
			console.error('Preflight failed, ', arguments);
		}

		function success(r, opts){
			console.log('Preflight success', arguments);

			var o = Ext.decode(r.responseText);
			console.log("Profile Schema is: ", o.ProfileSchema);
			Ext.callback(successCallBack, me, [o.ProfileSchema]);
		}

		var preflightUrl = this.getLink('upgrade_preflight_coppa_user'),
			req = {
				url: preflightUrl,
				params: JSON.stringify(params),
				method: 'POST',
				success: success,
				failure: fail
			},
			me= this;

		Ext.Ajax.request(req);
	},


	showSchemaFields: function(schema){
		var i, me = this, t, shouldAskAccountInfo = false;
		for(i in schema){
			if(schema.hasOwnProperty(i)){
				t = me.el.down('[name='+i+']');
				if(i === 'realname'){
					me.el.down('[name=last]').removeCls('hidden');
					me.el.down('[name=first]').removeCls('hidden');
				}
				if(!Ext.isEmpty(t)){
					t.removeCls('hidden');
					shouldAskAccountInfo = true;
				}
			}
		}

		if(shouldAskAccountInfo){
			me.accountInfoEl.show();
			Ext.defer(me.updateLayout, 1, me);
		}

		this.schema = schema;
	},


	getLink: function(link){
		var href = $AppConfig.userObject.get('href'),
			host = location.protocol + '//' + location.host;

		return  host + href + '/@@' + link;
	},


	showMonthPicker: function(){
		if(this.monthPickerView.isVisible()){
			this.monthPickerView.hide();
			return;
		}
		this.monthPickerView.showBy(this.monthEl, 'tl-bl?', [0,0]);
	},


	onSelectedItem: function(sel, record){
		this.monthEl.update(record.get('name'));
		this.monthEl.set({'data-value':record.get('id')});
	}

});