import React from 'react';
import PropTypes from 'prop-types';
import {Button, Prompt} from '@nti/web-commons';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';

import t2 from '../sections/assets/strings';
import {types} from '../sections/assets/constants';

import getWidget from './widgets';
import styles from './View.css';

const cx = classnames.bind(styles);
const t = scoped('nti-web-app.admin.branding.preview', {
	save: 'Apply Changes'
});


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
									<div className={cx('title')}>{t2(['types', type, 'title'])}</div>
									<Widget />
								</li>
							);
						})
					}
				</ul>
				{ onSave && (
					<div className={cx('controls')}>
						<Button onClick={onSave}>{t('save')}</Button>
					</div>
				)}
			</div>
		</Prompt.Dialog>
	);
}

Preview.propTypes = {
	onSave: PropTypes.func,
	onClose: PropTypes.func,
};
