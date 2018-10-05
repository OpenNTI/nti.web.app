import React from 'react';
import renderer from 'react-test-renderer';

import RecentSessions from '../RecentSessions';

/* eslint-env jest */
describe('Site admin user overview recent sessions', () => {
	test('Basic render test (2 sessions)', async () => {
		const historicalSessions = [
			{
				SessionStartTime: new Date('10/30/2017').getTime() / 1000
			},
			{
				SessionStartTime: (new Date('10/30/2017').getTime() / 1000) + 60
			}
		];

		const cmp = renderer.create(<RecentSessions historicalSessions={historicalSessions}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (no sessions)', async () => {
		const historicalSessions = [];

		const cmp = renderer.create(<RecentSessions historicalSessions={historicalSessions}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (10 sessions)', async () => {
		let historicalSessions = [];

		for(let i = 0; i < 10; i++) {
			historicalSessions.push({
				SessionStartTime: (new Date('10/30/2017').getTime() / 1000) + (i * 60)
			});
		}

		const cmp = renderer.create(<RecentSessions historicalSessions={historicalSessions}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
