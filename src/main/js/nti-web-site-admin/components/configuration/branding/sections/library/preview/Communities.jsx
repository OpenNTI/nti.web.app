import React from 'react';
import {Text} from '@nti/web-commons';
import classnames from 'classnames/bind';

import Avatar from './Avatar';
import Collection from './Collection';
import styles from './Communities.css';

const cx = classnames.bind(styles);


const communities = [
	{
		title: 'Town Square',
	}
];

export default function Communities () {
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
