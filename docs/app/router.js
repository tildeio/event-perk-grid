import EmberRouter from '@ember/routing/router';
import config from 'docs/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('getting-started');
  this.route('examples', function () {
    this.route('custom-element');
    this.route('using-apis');
  });
});
