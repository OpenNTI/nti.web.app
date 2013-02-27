describe("Note Tests", function() {

	function createNote(id, placeholder, children, referenceCount){
		var note = Ext.create('NextThought.model.Note', {
			NTIID: id,
			ReferencedByCount: referenceCount
		});
		note.placeholder = placeholder;
		note.children = children ? children.slice() : undefined;
		if(note.children){
			Ext.each(note.children, function(kid){
				kid.parent = note;
			});
		}
		return note;
	}


	describe('getDescendants', function(){

		function createEmptyStoreCallback(scope, obj){
			return function(store){
				expect(this).toBe(scope);
				expect(store).toBeTruthy();
				expect(store.getCount()).toBe(0);
				if(scope){
					scope.called = true;
				}
			};
		}

		it('Gracefully handles placeholder with no children', function(){
			var p = createNote('1', true), scope = {};

			p.getDescendants(createEmptyStoreCallback(scope), scope);
			expect(scope.called).toBeTruthy();
		});

		it('Gracefully handles note with no link', function(){
			var n = createNote('1', false), scope = {};
			spyOn(n, 'getLink').andReturn(null);

			n.getDescendants(createEmptyStoreCallback(scope), scope);

			expect(scope.called).toBeTruthy();
			expect(n.getLink).toHaveBeenCalledWith('replies');
		});

		it('Handles non placeholder root with children', function(){
			var root = createNote('root', false),
				scope = {};

			//root has 5 replies on the server

			function fakeLoadReplies(callback, scope){
				var store = NextThought.store.PageItem.create(), i;

				for(i = 0; i < 5; i++){
					store.add(createNote('c'+i));
				}

				Ext.callback(callback, scope, [store]);
			}

			spyOn(root, 'loadReplies').andCallFake(Ext.Function.bind(fakeLoadReplies, this));

			function onFinished(store){
				expect(this).toBe(scope);
				expect(store).toBeTruthy();
				expect(store.getCount()).toBe(5);
				for(i = 0; i < 5; i++){
					expect(store.getById('c'+i)).toBeTruthy();
				}
			}

			root.getDescendants(onFinished, scope);
		});

		it('Aggregates direct children', function(){
			var child1 = createNote('c1', false),
				child2 = createNote('c2', false),
				child3 = createNote('c3', false),
				kids = [child1, child2, child3],
				rootP = createNote('missing-root', true, kids),
				scope = {};

			//Each kid will simulate fetching a direct reply

			function fakeLoadReplies(callback, scope, kid){
				var store = NextThought.store.PageItem.create(),
					gc = createNote('gc-'+kid.getId());

				store.add(gc);
				Ext.callback(callback, undefined, [store]);
			}

			Ext.each(kids, function(kid){
				spyOn(kid, 'loadReplies').andCallFake(Ext.Function.bind(fakeLoadReplies, this, [kid], true));
			});

			function onFinished(store){
				expect(this).toBe(scope);
				expect(store).toBeTruthy();
				expect(store.getCount()).toBe(6);
				Ext.each(kids, function(kid){
					expect(store.getById(kid.getId())).toBeTruthy();
					expect(store.getById('gc-'+kid.getId())).toBeTruthy();
				});
			}

			rootP.getDescendants(onFinished, scope);

		});

		it('Aggregates recursively', function(){
			var grandChild1 = createNote('gcn', false),
				grandChild2 = createNote('gcn2', false),
				grandkids = [grandChild1, grandChild2],
				child1 = createNote('cn', false),
				child2 = createNote('cp', true, grandkids),
				kids = [child1, child2],
				rootP = createNote('missing-root', true, kids),
				scope = {};

			//Each kid will simulate fetching a direct reply

			function fakeLoadReplies(callback, scope, kid){
				var store = NextThought.store.PageItem.create(),
					gc = createNote('ggc-'+kid.getId());

				store.add(gc);
				Ext.callback(callback, undefined, [store]);
			}

			spyOn(grandChild2, 'loadReplies').andCallFake(Ext.Function.bind(fakeLoadReplies, this, [grandChild2], true));

			function onFinished(store){
				expect(this).toBe(scope);
				expect(store).toBeTruthy();
				expect(store.getCount()).toBe(4);
				expect(store.getById(child1.getId())).toBeTruthy();
				expect(store.getById(grandChild1.getId())).toBeTruthy();
				expect(store.getById(grandChild2.getId())).toBeTruthy();
				expect(store.getById('ggc-'+grandChild2.getId())).toBeTruthy();
			}

			rootP.getDescendants(onFinished, scope);

		});

	});


	describe('replyCount', function(){

		it('checks if replies have been loaded', function(){
			var child1 = createNote('c1', false),
				note = createNote('n1', true, [child1], 3);

			expect(note.get('ReferencedByCount')).toEqual(3);
			//For a placeholder, it's been loaded, if all its children have.
			expect(note.hasRepliesBeenLoaded(note)).toBeFalsy();
		});

		it('checks counting children', function(){
			var grandChild1 = createNote('gcn', false),
				grandChild2 = createNote('gcn2', false),
				grandkids = [grandChild1, grandChild2],
				child1 = createNote('cn', false),
				child2 = createNote('cp', true, grandkids),
				kids = [child1, child2],
				rootP = createNote('missing-root', true, kids);

			expect(rootP.countChildren()).toEqual(3);
		});

		it('checks summing all referenceCount', function(){
			var child1 = createNote('c1', false),
				child2 = createNote('c2', false, [], 3),
				child3 = createNote('c3', false, [],2),
				kids = [child1, child2, child3],
				rootP = createNote('missing-root', true, kids);

			delete rootP.raw.ReferencedByCount;
			expect(rootP.sumReferenceByCount(rootP)).toEqual(8);
		});
	});

	//TODO test that note with replies causes ajax request to the replies link?

	describe('like and unlike', function(){

		function createMockLikeWidget(){
			var m = jasmine.createSpyObj('mockWidget', ['markAsLiked', 'update']);
			//setup the mock widget to track some things
			m.markAsLiked.andCallFake(function(liked){
				this.liked = liked;
			});
			return m;
		}

		function mockLikeAction(o, success){
			spyOn(o, 'postTo').andCallFake(function(action, callback){
				Ext.callback(callback, this, [success ? {} : undefined]);
			});
		}

		function initializeLikeInfo(notes, likes){
			var total = Ext.Array.sum(likes),
				i = 0, n;

			function isLiked(){
				return this.get('LikeCount');
			}

			for(i=0;i<notes.length;i++){
				n = notes[i];
				n.set('LikeCount', likes[i]);
				n.isLiked = isLiked;
				if(!n.parent){
					n.raw.RecursiveLikeCount = total;
					n.set('RecursiveLikeCount', total);
				}
			}
		}

		it('like works with ds success', function(){
			var grandChild1 = createNote('gcn', false),
				grandkids = [grandChild1],
				child1 = createNote('cn', false, grandkids),
				kids = [child1],
				root = createNote('root', false, kids),
				notes = [root, child1, grandChild1],
				mockWidget = createMockLikeWidget();

			//make all these notes not be liked
			initializeLikeInfo(notes, [0,0,0]);

			expect(root.getTotalLikeCount()).toBe(0);

			//Mock our note we are going to like to act like a succesful post
			mockLikeAction(grandChild1, true);

			grandChild1.like(mockWidget);

			//like count should now be one
			//recursive like count should now be one
			expect(grandChild1.get('LikeCount')).toBe(1);
			expect(root.getTotalLikeCount()).toBe(1);

			//Widget assertions, addCls should have been called with on
			//and update should ahve been called with the new like count
			expect(mockWidget.liked).toBeTruthy();
		});

		it('unlike works with ds success', function(){
			var grandChild1 = createNote('gcn', false),
				grandkids = [grandChild1],
				child1 = createNote('cn', false, grandkids),
				kids = [child1],
				root = createNote('root', false, kids),
				notes = [root, child1, grandChild1],
				mockWidget = createMockLikeWidget();

			//make all these notes not be liked
			initializeLikeInfo(notes, [0,2,1]);

			expect(root.getTotalLikeCount()).toBe(3);

			//Mock our note we are going to like to act like a succesful post
			mockLikeAction(grandChild1, true);

			grandChild1.like(mockWidget);

			//like count should now be one
			//recursive like count should now be one
			expect(grandChild1.get('LikeCount')).toBe(0);
			expect(root.getTotalLikeCount()).toBe(2);

			//Widget assertions, addCls should have been called with on
			//and update should ahve been called with the new like count
			expect(mockWidget.liked).toBeFalsy();
		});

		it('unlike works with ds failure', function(){
			var grandChild1 = createNote('gcn', false),
				grandkids = [grandChild1],
				child1 = createNote('cn', false, grandkids),
				kids = [child1],
				root = createNote('root', false, kids),
				notes = [root, child1, grandChild1],
				mockWidget = createMockLikeWidget();

			//make all these notes not be liked
			initializeLikeInfo(notes, [0,2,1]);

			expect(root.getTotalLikeCount()).toBe(3);

			//Mock our note we are going to like to act like a succesful post
			mockLikeAction(grandChild1);

			grandChild1.like(mockWidget);

			//like count should now be one
			//recursive like count should now be one
			expect(grandChild1.get('LikeCount')).toBe(1);
			expect(root.getTotalLikeCount()).toBe(3);

			//Widget assertions, addCls should have been called with on
			//and update should ahve been called with the new like count
			expect(mockWidget.liked).toBeTruthy();
		});


		it('like works with ds failure', function(){
				var grandChild1 = createNote('gcn', false),
				grandkids = [grandChild1],
				child1 = createNote('cn', false, grandkids),
				kids = [child1],
				root = createNote('root', false, kids),
				notes = [root, child1, grandChild1],
				mockWidget = createMockLikeWidget();

			//make all these notes not be liked
			initializeLikeInfo(notes, [0,0,0]);

			expect(root.getTotalLikeCount()).toBe(0);

			//Mock our note we are going to like to act like a succesful post
			mockLikeAction(grandChild1);

			grandChild1.like(mockWidget);

			//like count should now be one
			//recursive like count should now be one
			expect(grandChild1.get('LikeCount')).toBe(0);
			expect(root.getTotalLikeCount()).toBe(0);

			//Widget assertions, addCls should have been called with on
			//and update should ahve been called with the new like count
			expect(mockWidget.liked).toBeFalsy();
		});
	});
});
