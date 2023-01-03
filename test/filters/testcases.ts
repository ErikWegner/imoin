import { expect } from 'chai';

import { FHost } from '../../scripts/monitors/filters/index.js';
import { FilterSettings } from '../../scripts/Settings.js';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder.js';
import { HostBuilder } from '../abstractHelpers/HostBuilder.js';
import { ServiceBuilder } from '../abstractHelpers/ServiceBuilder.js';
import { Host, ServiceState } from '../monitors/index.js';
import { TestCaseBuilderBase } from './testcasebuilderbase.js';

export function testcases(
  filter: (
    _hosts: FHost[] | null,
    _filtersettings?: FilterSettings
  ) => FHost[] | null,
  setupFilterSettings: (_sb: FilterSettingsBuilder) => void,
  hostFlagText: string,
  setupHost: (_lcb: HostBuilder) => void,
  setupService: (_sb: ServiceBuilder) => void
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
      expect(r).to.be.null;
    });

    it('should accept empty list', () => {
      // Arrange
      const m: Host[] = [];

      // Act
      const r = filter(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    testcasebuilder().hostDownAndFilterIndicatorIsSet('H1').shouldRemoveHost();

    testcasebuilder().hostDown('H1').shouldKeepHost();

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

    (<ServiceState[]>['WARNING', 'CRITIAL']).forEach((v: ServiceState) => {
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

      testcasebuilder().hostDown('H1').service('S1', v, true).shouldKeepHost();

      testcasebuilder()
        .hostDownAndFilterIndicatorIsSet('H1')
        .service('S1', v, true)
        .shouldRemoveHost();
    });
  };
}
