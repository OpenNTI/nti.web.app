describe("PresenceInfo Model",function(){
	var online, offline;

	beforeEach(function(){
		online = NextThought.model.PresenceInfo.createFromPresenceString("online","user1");
		offline = NextThought.model.PresenceInfo.createFromPresenceString("offline","user2");
	});

	it("createFromPresenceString tests",function(){
		expect(online.get("username")).toBe("user1");
		expect(online.get("type")).toBe("available");
		expect(offline.get("username")).toBe("user2");
		expect(offline.get("type")).toBe("unavailable");
	});

	it("isOnline tests",function(){
		expect(online.isOnline()).toBeTruthy();
		expect(offline.isOnline()).toBeFalsy();
	});

	it("toString tests", function(){
		expect(online.toString()).toBe("Online");
		expect(offline.toString()).toBe("Offline");
	});
});