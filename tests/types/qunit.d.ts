declare global {
  interface Assert {
    /**
     * Set how long to wait for async operations to complete before failing the test.
     *
     * @param duration The length of time, in milliseconds, to wait for async operations.
     * @link https://api.qunitjs.com/assert/timeout/
     */
    timeout(duration: number): void;
  }

  interface Config {
    timeout?: number;
  }
}

export {};
