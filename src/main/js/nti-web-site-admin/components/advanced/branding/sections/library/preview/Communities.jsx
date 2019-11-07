import React from 'react';
import PropTypes from 'prop-types';
import {Text} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Communities.css';

const cx = classnames.bind(styles);

import Avatar from './Avatar';
import Collection from './Collection';

const communities = [
	{
		title: 'Town Square',
	}
];

export default function Communities (props) {
	return (
		<Collection title="Communities">
			<ul className={cx('items')}>
				{communities.map(item => (
					<li key={item.title}>
						<div className={cx('community-item')}>
							<Avatar className={cx('community-avatar')} />
							<Text.Condensed>
								<span className={cx('item-title')}>{item.title}</span>
							</Text.Condensed>
						</div>
					</li>
				))}
			</ul>
		</Collection>
	);
}
