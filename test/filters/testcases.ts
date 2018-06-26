import { FHost } from '../../scripts/monitors/filters';
import { FilterSettings } from '../../scripts/Settings';
import { expect } from 'chai';
import { Monitor } from '../../scripts/monitors';
import { TestCaseBuilderBase } from './testcasebuilderbase';

export function testcases(
  filter: (hosts: FHost[], filtersettings?: FilterSettings) => FHost[],
  testcasebuilder: () => TestCaseBuilderBase
) {
  return () => {
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

    ['WARNING', 'CRITIAL'].forEach((v: Monitor.ServiceState) => {

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
