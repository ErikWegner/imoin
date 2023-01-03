import { filterSettingsTests } from '../filterSettingsTestsCommons.js';
import { testcases } from './testcases.js';

describe('Filters', () => {
  Object.keys(filterSettingsTests).forEach((description) => {
    const options = filterSettingsTests[description];
    describe(description,
      testcases(
        options.filterFunction,
        options.setupFilterSettingsBuilder,
        options.filterFlagText,
        options.setupHost,
        options.setupService)
    );
  });
});
