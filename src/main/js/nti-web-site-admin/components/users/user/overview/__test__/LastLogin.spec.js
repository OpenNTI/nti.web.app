import { create, act } from 'react-test-renderer';

import LastLogin from '../LastLogin';

/* eslint-env jest */
describe('Site admin user overview last login', () => {
	test('Basic render test', async () => {
		const historicalSessions = [
			{
				SessionStartTime: new Date('10/30/2017').getTime() / 1000,
			},
		];

		const user = {};

		let cmp;
		act(() => {
			cmp = create(
				<LastLogin
					user={user}
					historicalSessions={historicalSessions}
				/>
			);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
