describe("Service Tests", function() {

	describe("urlWithQueryParams", function(){
		var service = new NextThought.model.Service(),
			params = {pizza: 'cheese'},
			base = 'http://google.com';

		it('handles no object', function(){
			expect(service.urlWithQueryParams(base)).toBe(base);
		});

		it('handles base with no params', function(){
			expect(service.urlWithQueryParams(base, params)).toBe(base+'?pizza=cheese');
		});

		it('handles base with params', function(){
			var theBase = base+'?fruit=apple';
			expect(service.urlWithQueryParams(theBase, params)).toBe(theBase+'&pizza=cheese');
		});
	});

	describe('getObject(s) tests', function(){
		var service, ntiids, callCount;

		beforeEach(function(){
			service = NextThought.model.Service.create();

			callCount = 0;

			ntiids = [
				'tag:nextthought.com,2011-10:system-NamedEntity:ntiid1',
				'tag:nextthought.com,2011-10:system-NamedEntity:ntiid2',
				'tag:nextthought.com,2011-10:system-NamedEntity:ntiid3'
			];

			spyOn(service,'getObject').andCallFake(function(ntiid, success, failure, scope, safe){
				callCount++;
				success.call(scope, ntiid);
			});
		});

		it('Calling getObjects with only ntiids preserves order', function(){
			var flag = false, result, me = this;
			
			function success(r){
				result = r;
				flag = true;
			}

			function failure(){
				flag = true;
			}

			service.getObjects(ntiids, success, failure, me, false);

			waitsFor(function(){
				return flag;
			},'getObjects never finished', 600);

			runs(function(){
				var diff = Ext.Array.difference(result, ntiids);

				expect(Ext.isEmpty(diff)).toBeTruthy();
				expect(Ext.Array.equals(result, ntiids));
				expect(callCount).toBe(ntiids.length);

				Ext.each(ntiids, function(n){
					var f = jasmine.any(Function);

					expect(service.getObject).toHaveBeenCalledWith(n, f, f, me, false);
				}, this);
			});
		});

		it('Calling getObjects with mixed ntiids, has null for non-ntiids', function(){
			var flag = false, result, me = this,
				entities = ntiids.slice(),
				expected = ntiids.slice();

			entities.push('nonntiid1', 'nonntiid2');
			expected.push(null,null);

			function success(r){
				result = r;
				flag = true;
			}

			function failure(){
				flag = true;
			}

			service.getObjects(entities, success, failure, me, false);

			waitsFor(function(){
				return flag;
			},'getObjects never finished', 600);

			runs(function(){
				expect(Ext.Array.equals(expected, result));
				expect(callCount).toBe(entities.length);
				Ext.each(ntiids, function(n){
					var f = jasmine.any(Function);

					expect(service.getObject).toHaveBeenCalledWith(n, f, f, me, false);
				}, this);
			});
		});
	});
});
