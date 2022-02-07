import { config } from 'qunit';
import DOMAssertions from 'qunit-dom/dist/assertions';
import { DataFactory } from './helpers/data-factory';

export type TestContext = {
  pauseTest(): Promise<void>;
  resumeTest(): void;
  factory: DataFactory;

  [key: string]: unknown;
};

export type RenderingTestContext = TestContext & {
  element: HTMLDivElement;
};

declare global {
  interface Window {
    resumeTest?: (() => void) | undefined;
  }

  interface QUnit {
    urlParams: { devmode?: boolean };
  }

  interface Assert {
    dom(
      target?: string | Element | null,
      rootElement?: Element | ShadowRoot
    ): DOMAssertions;
  }
}

let currentContext: TestContext | undefined;

export function configureQUnit(): void {
  config.urlConfig.push({ id: 'devmode', label: 'Development mode' });
}

/** Resumes a test previously paused by `await this.pauseTest()`. */
export function resumeTest(): void {
  if (!currentContext) {
    throw new Error(
      'Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.'
    );
  }

  currentContext.resumeTest();
}

export function setupTest(hooks: NestedHooks): void {
  hooks.beforeEach(function (this: TestContext, assert) {
    // eslint-disable-next-line unicorn/no-this-assignment
    currentContext = this;
    let resume: undefined | (() => void);
    this.resumeTest = function globalResumeTest() {
      if (!resume) {
        throw new Error(
          'Testing has not been paused. There is nothing to resume.'
        );
      }

      resume();

      resume = undefined;
      window.resumeTest = undefined;
    };

    this.pauseTest = function globalPauseTest() {
      console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

      return new Promise((resolve) => {
        resume = resolve;
        window.resumeTest = resumeTest;
      });
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalPauseTest = this.pauseTest;
    this.pauseTest = function pauseQUnitTest() {
      assert.timeout(-1); // prevent the test from timing out

      // This is a temporary work around for
      // https://github.com/emberjs/ember-qunit/issues/496 this clears the
      // timeout that would fail the test when it hits the global testTimeout
      // value.
      clearTimeout(QUnit.config.timeout);
      return originalPauseTest.call(this);
    };

    this.factory = new DataFactory();
  });

  hooks.afterEach(function (this: TestContext) {
    currentContext = undefined;
  });
}

export function setupRenderingTest(hooks: NestedHooks): void {
  setupTest(hooks);

  hooks.beforeEach(function (this: RenderingTestContext) {
    const testContainer = document.querySelector('#qunit-fixture');

    if (!testContainer) {
      throw new Error('Could not find element #qunit-fixture');
    }

    if (!(testContainer instanceof HTMLDivElement)) {
      throw new TypeError('Expected #qunit-fixture to be a div');
    }

    this.element = testContainer;

    if (QUnit.urlParams.devmode) {
      this.element.classList.add('full-screen');
    }

    // @ts-expect-error QUnit dom types not complete
    QUnit.assert.dom.rootElement = testContainer;
  });

  hooks.afterEach(function (this: RenderingTestContext) {
    this.element.innerHTML = '';
    if (this.element.shadowRoot) {
      this.element.shadowRoot.innerHTML = '';
    }

    if (QUnit.urlParams.devmode) {
      this.element.classList.remove('full-screen');
    }
  });
}
