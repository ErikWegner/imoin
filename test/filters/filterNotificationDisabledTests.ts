import 'mocha';
import { filterNotificationDisabled } from '../../scripts/monitors/filters';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { TestCaseBuilderBase } from './testcasebuilderbase';
import { testcases } from './testcases';
import { ServiceBuilder } from '../abstractHelpers/ServiceBuilder';

class TestCaseBuilder extends TestCaseBuilderBase {
  public static withEnabledFilter() {
    return new TestCaseBuilder(true);
  }

  protected filter = filterNotificationDisabled;

  protected enable(sb: FilterSettingsBuilder): void {
    sb.filterOutNotificationDisabled();
  }

  protected setFlagTextAndFilterIndicatorOnHost() {
    this.flagText = 'with disabled notifications';
    this.b.disableNotifications();
  }

  protected generateServiceTextWhenFilterIndicatorIsSet(): string {
    return this.servicetext + ' with notifications disabled';
  }

  protected setServiceFilterIndicator(sb: ServiceBuilder) {
    sb.notificationsDisabled();
  }
}

describe(
  'filterNotificationDisabled',
  testcases(
    filterNotificationDisabled,
    () => TestCaseBuilder.withEnabledFilter())
);
