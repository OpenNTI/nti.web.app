Ext.define('NextThought.app.course.assessment.components.admin.email.ScopeTokenField', {
	extend: 'NextThought.app.sharing.components.UserTokenField',
	alias: ['widget.course-scope-list'],
	requires: [
		'NextThought.app.course.assessment.components.admin.email.components.ScopeSearch'
	],

	cls: 'user-token-field email-token-field',
	placeholder: 'Add a recipient',


	setupPickerView: function(){
		var spEl = this.scrollParentEl;

		this.pickerView = Ext.widget('scope-sharesearch', {
			ownerCls: this.ownerCls,
			focusOnToFront: false,
			renderTo: spEl || Ext.getBody(),
			selectItem: this.searchItemSelected.bind(this),
			stopHide: this.stopPickerHide()
		});
	},


	containsToken: function(model) {
		if (!model) {return true;}

		var name = model.get('realname'), c;
		c = Ext.Array.filter(this.selections, function(o, i) { return o.get('realname') === name; });
		return c.length > 0;
	},


	setInitialToken: function(scope) {
		var token = this.suggestionStore.findRecord('realname', scope);

		if (token) {
			this.addSelection(token);
		}
	},


	setNonEditableToken: function(token){
		if(token) {
			this.addSelection(token);
			this.el.addCls('readOnly');
		}
	},

	
	updatePlaceholderLabel: function(e) {
		this.setPlaceholderText('   ');
	},


	onBeforeAddToken: function(record) {
		if (!Ext.isEmpty(this.selections) && !this.containsToken(record)) {
			// NOTE: All Students and Enrolled Students are hieararchical scopes, 
			// so for now, selecting one un-does the other, since it would cause a confusion otherwise.
			this.removeTokenForUser(this.selections[0]);
		}
	},


	addToken: function(record) {
		var value = record && record.get('displayName'),
			type = this.getType(record.getData()),  t;

		this.onBeforeAddToken(record);
		if (this.isToken(value) && !record.Unresolved) {
			t = this.addTag(value, type);
			if (t && t.hasCls('token')) {
				t.addCls('active');
			}

			this.updatePlaceholderLabel();
		} else if (!this.containsUnresolved() && record.Unresolved) {
			this.addTag('Others', type);
			this.updatePlaceholderLabel();
		}

		this.fireEvent('sync-height', this);
		this.fireEvent('selection-changed', record);
	},


	getInsertionPoint: function() {
		return this.wrapEl;
	},


	buildSuggestionStore: function() {
		var data = [],
			store = new Ext.data.Store({
				model: 'NextThought.model.UserSearch'
			});

		data.push(NextThought.model.UserSearch.create({
			realname: 'All Students',
			studentFilter: 'All',
			isLabel: true
		}));

		data.push(NextThought.model.UserSearch.create({
			realname: 'Enrolled Students',
			studentFilter: 'ForCredit',
			isLabel: true
		}));

		store.loadRecords(data);
		return store;
	}
});