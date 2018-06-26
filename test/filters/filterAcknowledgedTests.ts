import 'mocha';
import { filterAcknowledged } from '../../scripts/monitors/filters';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { TestCaseBuilderBase } from './testcasebuilderbase';
import { testcases } from './testcases';
import { ServiceBuilder } from '../abstractHelpers/ServiceBuilder';

class TestCaseBuilder extends TestCaseBuilderBase {
  public static withEnabledFilter() {
    return new TestCaseBuilder(true);
  }

  protected filter = filterAcknowledged;

  protected enable(sb: FilterSettingsBuilder): void {
    sb.filterOutAcknowledged();
  }

  protected setFlagTextAndFilterIndicatorOnHost() {
    this.flagText = 'with disabled notifications';
    this.b.HasBeenAcknowledged();
  }

  protected generateServiceTextWhenFilterIndicatorIsSet(): string {
    return 'acknowledged ' + this.servicetext;
  }

  protected setServiceFilterIndicator(sb: ServiceBuilder) {
    sb.hasBeenAcknowledged();
  }
}

describe(
  'filterAcknowledged',
  testcases(
    filterAcknowledged,
    () => TestCaseBuilder.withEnabledFilter())
);
