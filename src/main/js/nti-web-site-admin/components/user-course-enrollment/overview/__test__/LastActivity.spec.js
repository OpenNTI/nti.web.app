import React from 'react';
import renderer from 'react-test-renderer';

import LastActivity from '../LastActivity';

/* eslint-env jest */
describe('Site admin user course enrollment overview last activity widget', () => {
	test('Basic render test', async () => {
		const enrollment = {
			getLastSeenTime: () => new Date('10/30/2017')
		};

		const cmp = renderer.create(<LastActivity enrollment={enrollment}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
