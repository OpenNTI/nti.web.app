export default function readFile (file) {
	return new Promise((fulfill, reject) => {
		const reader = new FileReader();

		reader.onerror = reject;
		reader.onload = () => {
			const {result: source} = reader;

			fulfill(source);
		};

		reader.readAsDataURL(file);
	});
}