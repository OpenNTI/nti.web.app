import classnames from 'classnames/bind';

import Styles from './Styles.css';
import Registry from './Registry';

import './topic';
import './note';

const cx = classnames.bind(Styles);

export const viewClassName = cx('community-view-override');
export const topicWindowClassName = cx('community-override-paging-window');
export const Overrides = Registry.getInstance();