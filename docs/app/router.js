import EmberRouter from '@ember/routing/router';
import config from 'docs/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('installation');
  this.route('usage', function () {
    this.route('script-tag-custom-element');
    this.route('import-custom-element');
    this.route('using-apis');
  });
  this.route('not-found', { path: '/*path' });
});
