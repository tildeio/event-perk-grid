import 'qunit/qunit/qunit.css';
import '../src/index.css';
import './test-styles.css';

import 'qunit';
import 'qunit-dom/dist/qunit-dom';
import { configureQUnit } from './test-setup';

import './render-test';
import './fetch-data-test';
import './custom-element-test';

configureQUnit();
