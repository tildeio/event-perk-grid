import { assertExists } from './types/utils';

const API_ROOT = assertExists(process.env['API_ROOT']);

export { API_ROOT };
