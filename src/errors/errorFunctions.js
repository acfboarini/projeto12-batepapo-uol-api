const errorTypes = {
	409: 'conflict',
	404: 'bad_request',
	400: 'not_found',
	422: 'processable_entity',
};

export function errorMaker(code) {
	if (errorTypes[code]) return { code, message: errorTypes[code] };
	return { code: 500 };
}
