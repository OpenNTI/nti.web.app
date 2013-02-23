describe("Base Model Tests", function() {
    describe ('Relative Time Tests', function(){
        it('test day code executes', function(){
            var b = Ext.create('NextThought.model.Base', {
                'CreatedTime': new Date()
            });
            expect(b.getRelativeTimeString()).toBeTruthy();
        });

        it('timeDifference 1s', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000;

            expect(b.timeDifference(now, then)).toEqual('1 second ago');
        });

        it('timeDifference 1m', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000*60;

            expect(b.timeDifference(now, then)).toEqual('1 minute ago');
        });

        it('timeDifference 1h', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000*60*60;

            expect(b.timeDifference(now, then)).toEqual('1 hour ago');
        });
        it('timeDifference 1d', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000*60*60*24;

            expect(b.timeDifference(now, then)).toEqual('1 day ago');
        });
        it('timeDifference 2s', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000;

            expect(b.timeDifference(now, then)).toEqual('2 seconds ago');
        });

        it('timeDifference 2m', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000*60;

            expect(b.timeDifference(now, then)).toEqual('2 minutes ago');
        });

        it('timeDifference 2h', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000*60*60;

            expect(b.timeDifference(now, then)).toEqual('2 hours ago');
        });
        it('timeDifference 2d', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000*60*60*24;

            expect(b.timeDifference(now, then)).toEqual('2 days ago');
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
				expect(observer.fieldChanged).toHaveBeenCalledWith(field, 'foo', jasmine.any(Object));
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
				expect(observer.fieldChanged).toHaveBeenCalledWith(dependentField, 'baz', jasmine.any(Object));
			});
		});
	});
});
