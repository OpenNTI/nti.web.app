Ext.define('NextThought.model.TestBase', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.converters.GroupByTime'
	],

	fields: [
		{
			name: 'GroupingField',
			mapping: 'Last Modified',
			type: 'groupByTime',
			persist: false,
			affectedBy: 'Last Modified'
		}
	]
});


describe("Base Model Tests", function() {
    describe ('Relative Time Tests', function(){
        it('test day code executes', function(){
            var b = Ext.create('NextThought.model.Base', {
                'CreatedTime': new Date()
            });
            expect(b.getRelativeTimeString()).toBeTruthy();
        });
    });

	describe('field events', function(){

		function createModel(opts){
			var m = Ext.create('NextThought.model.Base', opts);
			return m;
		}

		it('doesn\'t crater on a null observer', function(){
			var m = createModel();

			m.addObserverForField(null);
			m.removeObserverForField(null);
		});

		describe('Test set triggers events appropriately', function(){

			var m, observer, scope = {};
			var field = 'ContainerId';

			beforeEach(function(){
				m = createModel({'ContainerId': 'bar'});
				observer = new Ext.util.Observable({fieldChanged: Ext.emptyFn});
				spyOn(observer, 'fieldChanged');
				m.addObserverForField(observer, field, observer.fieldChanged, scope);
			});

			it('calls the observer when a field is changed', function(){
				m.set('ContainerId', 'foo');
				expect(observer.fieldChanged.calls.length).toEqual(1);
				expect(observer.fieldChanged).toHaveBeenCalledWith(field, 'foo');
			});

			it('Only calls if field changed', function(){
				m.set('ContainerId', 'bar');
				expect(observer.fieldChanged).not.toHaveBeenCalled();
			});

			it('Wont call if observer is removed', function(){
				m.removeObserverForField(observer, field, observer.fieldChanged, scope);
				m.set('ContainerId', 'foo');
				expect(observer.fieldChanged).not.toHaveBeenCalled();
			});
		});

		describe('dependent fields get notified also', function(){
			var m, observer, scope = {};
			var field = 'ContainerId', dependentField = 'foo';

			beforeEach(function(){
				m = createModel({'ContainerId': 'one'});
				m.valuesAffectedByContainerId = function(){ return [dependentField]; };
				m.getFoo = function(){ return this.get('ContainerId')};

				observer = new Ext.util.Observable({fieldChanged: Ext.emptyFn});
				spyOn(observer, 'fieldChanged');
				m.addObserverForField(observer, dependentField, observer.fieldChanged, scope);
			});

			it('fires for dependent field', function(){
				m.set('ContainerId', 'baz');
				expect(observer.fieldChanged.calls.length).toEqual(1);
				expect(observer.fieldChanged).toHaveBeenCalledWith(dependentField, 'baz');
			});
		});
	});

	describe('affectedBy', function(){

		it('Affecting fields trigger affected by fields to be reconverted', function(){
			var model = NextThought.model.TestBase.create({'Last Modified': 0});

			expect(model.get('GroupingField')).toBe('I Older');
			model.set('Last Modified', new Date().getTime() / 1000);
			expect(model.get('GroupingField')).toBe('A ');
		});
	});
});
