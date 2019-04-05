export Modal from './Modal';

export function isCourseContentModalOpen () {
	return typeof document !== 'undefined' && document.documentElement.classList.contains('nti-course-content-open');
}
