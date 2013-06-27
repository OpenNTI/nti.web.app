Ext.define('NextThought.view.account.coppa.upgraded.Confirm', {
	extend: 'Ext.Component',
	alias: 'widget.coppa-birthday-form',

	requires:[
		'NextThought.view.account.coppa.upgraded.MonthPicker'
	],

	cls: 'coppa-form',

	renderTpl: Ext.DomHelper.markup([{
		cls:'birthday-info', cn: [
			{cls:'legend', html:'When is your birthday?'},
			{cls:'fields', cn:[
				{cls:'birthdate', cn:[
					{cls:'month selectbox', 'data-required': true, value:'', html:'Month'},
					{tag:'input', type: 'text', placeholder: 'Day', name: 'day', size:'2'},
					{tag:'input', type: 'text', placeholder: 'Year', name: 'year', size:'3'},
					{cls:'continue', html:'Continue'},
					{cls:'validation-message'}
				]}
			]}
		]},{
		cls:'account-info', cn:[
			{cls:'legend', html: 'Account Information'},
			{cls:'fields', cn:[
				{cls: 'realname hidden', cn:[
					{tag:'input', type: 'text', 'data-required': true, placeholder: 'First Name', name: 'first', size:'4'},
					{tag:'input', type: 'text', placeholder: 'Last Name', name: 'last', size:'4'},
					{tag:'span', cls:'validation-message', html:'Please enter your first and last name.'}
				]},
				{cls:'email hidden', cn:[
					{tag:'input', type: 'text','data-required': true, placeholder: 'Your Email', name: 'email', size:'5'},
					{tag:'span', cls:'validation-message', html:'What\'s your email address?'}
				]},
				{cls:'contact_email hidden', cn:[
					{tag:'input', type: 'text', 'data-required': true, placeholder: 'Parent\'s Email', name: 'contact_email', size:'5'},
					{tag:'span', cls:'validation-message long', html:'We need your parent\'s permission to activate social features on your account.'}
				]}
			]},
			{cls:'save', html:'Save Changes'},
			{cls:'policy-link hidden', html: 'Child\'s Privacy Policy'}
		]}
	]),

	renderSelectors:{
		monthEl:'.month',
		accountInfoEl:'.account-info',
		continueEl: '.continue',
		saveEl: '.save',
		policyEl: '.policy-link'
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
		this.mon(this.policyEl, 'click', this.openPolicy, this);

		this.fieldsChannel = {
			'birthdate': this.getBirthdayValue,
			'realname': this.getRealName,
			'contact_email': function(){ return me.el.down('[name=contact_email]').getValue(); },
			'email': function(){ return me.el.down('[name=email]').getValue(); }
		};

		this.monthPickerView.show().hide();
		this.validated = {};
	},


	getFormValues: function(){
		var me = this, i, v,
			canSave = true,
			params = {}, msg;
		for(i in me.schema){
			if(me.schema.hasOwnProperty(i)){
				v = me.fieldsChannel[i].call(me);

				//Need to do a better validation job.
				if(Ext.isEmpty(v)){
					console.warn('required field ', i, 'is empty!');
					canSave = false;
					msg = i +' is a required field';
					me.markInvalidated({field:i, message:msg});
				}
				params[i] = v;
			}
		}

		this.validated = params;
		return canSave ? params : null;
	},


	markInvalidated: function(param){
		var el, e;
		try{
			el = this.el.down('.'+param.field);
			el.removeCls('valid').addCls('invalid');
			e = el.down('.validation-message');
			if(e){
				e.update(param.message);
				e.addCls('error');
			}
		}
		catch(e){
			console.error('Error: ', e);
		}
	},

	markValidated: function(param){
		var el, e;
		try{
			el = this.el.down('.'+param.field);
			el.removeCls('invalid').addCls('valid');
			e = el.down('.validation-message');
			if(e){
				e.update(param.message);
				e.removeCls('error');
			}
		}
		catch(e){
			console.error('Error: ', e);
		}
	},


	markFields: function(){
		var key, schema = this.schema, me = this;
		for(key in schema) {
			if(schema.hasOwnProperty(key) && me.validated.hasOwnProperty(key) && key !== 'birthdate'){
				me.markValidated({field:key, message:'Got it'});
			}
		}
	},


	save: function(){
		function fail(res, req){
			var r = Ext.decode(res.responseText);
			me.markFields();
			me.markInvalidated(r);
			console.log('FAIL: ', r);
		}

		var params = this.getFormValues(),
			me = this, url, req, p;

		if(Ext.isEmpty(params)){ return; }

		url = this.getLink('upgrade_coppa_user');
		req = {
			url: url,
			params: JSON.stringify(params),
			method: 'POST',
			success: function(r, opts){
				console.log('SUCCESS Account Upgraded: ', arguments);

				function s(){
					console.log('Success update to service doc:', arguments);
					if($AppConfig.service.canFriend()){
						p.destroy();
						// NOTE: We would for the sidebar to now reflect the fact that this user
						// can now have social features. Since we set that early when the app starts,
						// we don't have a way of updating the sidebar. Thus we require a full reload.
						// this is not the best solution. Ideally we wouldn't want a full reload.
						location.reload();
					}
					else{
						Ext.defer(p.destroy, 1, p);
					}
				}
				function f(){
					console.log('failure update:', arguments);
					Ext.defer(p.destroy, 1, p);
				}

				p = me.up('coppa-confirm-window');
				// Fire event to trigger the service doc to update.
				me.fireEvent('refresh-service-doc', s, f);
			},
			failure: fail
		};

		Ext.Ajax.request(req);
	},

	openPolicy: function(e){
		e.stopEvent();

		var w = Ext.widget('nti-window',{
			title: 'Children\'s Privacy Policy',
			closeAction: 'hide',
			width: '60%',
			height: '75%',
			layout: 'fit',
			modal: true,
			items: {
				xtype: 'component',
				cls: 'padded',
				autoEl: {
					tag: 'iframe',
					src: $AppConfig.links.childs_privacy,
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0,
					seamless: true,
					transparent: true,
					allowTransparency: true,
					style: 'overflow-x: hidden; overflow-y:auto'
				}
			}
		});

		w.show();
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

	},


	lockBirthday: function(){
		this.continueEl.update('Thanks!');
		this.continueEl.addCls('submitted');

		this.el.down('.birthdate').removeCls('invalid').addCls('valid');
		this.el.down('.birthdate > .validation-message').update('');
		this.monthEl.set({'disabled':'disabled'});
		this.el.down('[name=day]').set({'disabled':'disabled'});
		this.el.down('[name=year]').set({'disabled':'disabled'});
	},


	getBirthdayValue: function(){
		function isValidBirthday(){
			return (bd && !isNaN(bd.getTime()) && bd.getFullYear() === y && bd.getMonth() === m && bd.getDate() === d);
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

		me.markInvalidated({field:'birthdate', message:'Please enter a valid date'});
		return null;
	},


	preflight: function(params, successCallBack, failCallBack){
		function fail(){
			console.error('Preflight failed, ', arguments);
			Ext.callback(failCallBack, me, arguments);
		}

		function success(r, opts){
			var o = Ext.decode(r.responseText);

			console.log('Preflight success', arguments);
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
				t = me.el.down('.'+i);
				if(!Ext.isEmpty(t)){
					t.removeCls('hidden');
					shouldAskAccountInfo = true;
				}
			}
		}

		if(shouldAskAccountInfo){
			me.lockBirthday();
			me.accountInfoEl.show();
			if(schema.contact_email){
				me.el.down('.policy-link').removeCls('hidden');
			}
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