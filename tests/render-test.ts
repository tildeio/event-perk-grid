import { module, test } from 'qunit';
import render from '../src/render';
import {
  EVENT_DATA_FACTORY,
  PACKAGE_FACTORY,
  PERK_FACTORY,
  PERK_WITH_VALUE_FACTORY,
} from './helpers/data-factory';

module('render', function () {
  test('it works', function (assert) {
    const element = document.createElement('div');
    const shadow = element.attachShadow({ mode: 'open' });

    const perks = ['Good', 'Better', 'Best'].map((description) =>
      PERK_FACTORY.create({ description })
    );
    const packages = ['Bronze', 'Silver', 'Gold'].map((name) =>
      PACKAGE_FACTORY.create({
        name,
        perks: perks.map((p) => PERK_WITH_VALUE_FACTORY.create(p)),
      })
    );
    const data = EVENT_DATA_FACTORY.create({
      name: 'My Event',
      perks,
      packages,
    });

    render(shadow, data);

    assert.ok(shadow.querySelector('div'));
  });
});
