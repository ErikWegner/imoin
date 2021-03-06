import { filterSettingsTests } from '../filterSettingsTestsCommons';
import { testcases } from './testcases';

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
