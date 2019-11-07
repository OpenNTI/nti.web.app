import React from 'react';
import {Text} from '@nti/web-commons';
import classnames from 'classnames/bind';

import Avatar from './Avatar';
import styles from './Library.css';

const cx = classnames.bind(styles);

const communities = [
	{
		title: 'Town Square',
	}
];

export default function Library (props) {
	return (
		<div className={cx('library-root')}>
			<div className={cx('section-heading')}>
				<h1 className={cx('title')}>Communities</h1>
			</div>
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
		</div>
	);
}
