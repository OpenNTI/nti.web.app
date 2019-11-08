import React from 'react';
import PropTypes from 'prop-types';
import {Button, Prompt} from '@nti/web-commons';
import classnames from 'classnames/bind';

import t from '../sections/assets/strings';
import {types} from '../sections/assets/constants';

import getWidget from './widgets';
import styles from './View.css';

const cx = classnames.bind(styles);

export default function Preview ({onSave, onClose}) {
	return (
		<Prompt.Dialog>
			<div className={cx('preview-dialog')}>
				<span className="icon-light-x" onClick={onClose} />
				<ul>
					{
						Object.values(types).map(type => {
							const Widget = getWidget(type);
							return !Widget ? null : (
								<li key={type}>
									<div className={cx('title')}>{t(['types', type, 'title'])}</div>
									<Widget />
								</li>
							);
						})
					}
				</ul>
				{ onSave && (
					<div className={cx('controls')}>
						<Button onClick={onSave}>Apply Changes</Button>
					</div>
				)}
			</div>
		</Prompt.Dialog>
	);
}
