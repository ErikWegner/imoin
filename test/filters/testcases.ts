import { expect } from 'chai';
import { FHost } from '../../scripts/monitors/filters';
import { FilterSettings } from '../../scripts/Settings';
import { Monitor } from '../../scripts/monitors';
import { TestCaseBuilderBase } from './testcasebuilderbase';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { HostBuilder } from '../abstractHelpers/HostBuilder';
import { ServiceBuilder } from '../abstractHelpers/ServiceBuilder';

export function testcases(
  filter: (hosts: FHost[] | null, filtersettings?: FilterSettings) => FHost[] | null,
  setupFilterSettings: (sb: FilterSettingsBuilder) => void,
  hostFlagText: string,
  setupHost: (lcb: HostBuilder) => void,
  setupService: (sb: ServiceBuilder) => void,
) {
  return () => {
    function testcasebuilder() {
      return new TestCaseBuilderBase(
        filter,
        setupFilterSettings,
        hostFlagText,
        setupHost,
        setupService
      );
    }

    it('should accept null', () => {
      // Act
      const r = filter(null);
      // Assert
      // tslint:disable-next-line:no-unused-expression
      expect(r).to.be.null;
    });

    it('should accept empty list', () => {
      // Arrange
      const m: Monitor.Host[] = [];

      // Act
      const r = filter(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    testcasebuilder()
      .hostDownAndFilterIndicatorIsSet('H1')
      .shouldRemoveHost();

    testcasebuilder()
      .hostDown('H1')
      .shouldKeepHost();

    testcasebuilder()
      .hostUp('H1')
      .service('S1', 'OK')
      .shouldKeepHostWithService(); // the filter does not handle this

    testcasebuilder()
      .hostDown('H1')
      .service('S1', 'OK')
      .shouldKeepHostWithService(); // the filter does not handle this

    testcasebuilder()
      .hostDownAndFilterIndicatorIsSet('H1')
      .service('S1', 'OK')
      .shouldKeepHostWithService(); // the filter does not handle this

    (<Monitor.ServiceState[]>['WARNING', 'CRITIAL']).forEach((v: Monitor.ServiceState) => {

      testcasebuilder()
        .hostUp('H1')
        .service('S1', v)
        .shouldKeepHostWithService();

      testcasebuilder()
        .hostDown('H1')
        .service('S1', v)
        .shouldKeepHostWithService();

      testcasebuilder()
        .hostDownAndFilterIndicatorIsSet('H1')
        .service('S1', v)
        .shouldKeepHostWithService();

      testcasebuilder()
        .hostDown('H1')
        .service('S1', v, true)
        .shouldKeepHost();

      testcasebuilder()
        .hostDownAndFilterIndicatorIsSet('H1')
        .service('S1', v, true)
        .shouldRemoveHost();
    });
  };
}
