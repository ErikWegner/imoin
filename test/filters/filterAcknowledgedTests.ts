import 'mocha';
import { assert, expect } from 'chai';
import { fail } from 'assert';
import { filterAcknowledged, FHost } from '../../scripts/monitors/filters';
import { Monitor } from '../../scripts/monitors/MonitorData';
import { LoadCallbackBuilder } from '../abstractHelpers/LoadCallbackBuilder';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { FilterSettings } from '../../scripts/Settings';

class TestCaseBuilder {
  public static withEnabledFilter() {
    return new TestCaseBuilder(true);
  }

  private s: FilterSettings;
  private b = new LoadCallbackBuilder();
  private hostStatus = 'UP';
  private ackflag = '';
  private servicetext = '';

  constructor(enabled: boolean) {
    const sb = FilterSettingsBuilder
      .plain();
    if (enabled) {
      sb.filterOutAcknowledged();
    }
    this.s = sb.build();
  }

  public hostUp(name: string) {
    this.b.Host(name);
    return this;
  }

  public hostDown(name: string) {
    this.hostDownWithAckFlag(name, false);
    return this;
  }

  public hostDownAcknowledged(name: string) {
    this.hostDownWithAckFlag(name, true);
    return this;
  }

  public hostDownWithAckFlag(name: string, ackFlag: boolean) {
    this.hostStatus = 'DOWN';
    this.b
      .Host(name)
      .Down()
      ;
    if (ackFlag) {
      this.ackflag = 'with ack flag';
      this.b.HasBeenAcknowledged();
    }

    return this;
  }

  public service(name: string, state: Monitor.ServiceState, ack = false) {
    this.servicetext = state + ' service';
    this.b.Service(name, (sb) => {
      sb.withStatus(state);
      if (ack) {
        this.servicetext = 'acknowledged ' + this.servicetext;
        sb.hasBeenAcknowledged();
      }
    });
    return this;
  }

  public shouldRemoveHost() {
    this.runTest(false, false);
  }

  public shouldKeepHost() {
    this.runTest(true, false);
  }

  public shouldKeepHostWithService() {
    this.runTest(true, true);
  }

  private runTest(keepHost: boolean, keepService: boolean) {
    const verbHost = keepHost ? 'keep' : 'remove';
    const verbService = keepService ? 'keep' : 'remove';
    const expectedHosts = keepHost ? 1 : 0;
    const expectedServices = keepService ? 1 : 0;
    let testText = 'should ' + verbHost + ' ' + this.hostStatus + ' host';
    if (this.ackflag !== '') {
      testText += ' ' + this.ackflag;
    }
    if (this.servicetext !== '') {
      testText += ' and ' + verbService + ' ' + this.servicetext;
    }
    it(testText, () => {
      const m = this.b.GetHosts();

      // Act
      const r = filterAcknowledged(FHost.map(m), this.s);

      // Assert
      expect(r).to.have.lengthOf(expectedHosts, 'number of hosts');
      if (r.length > 0) {
        expect(r[0].getFServices()).to.have.lengthOf(expectedServices, 'number of services');
      }
    });
  }
}

describe('filterAcknowledged', () => {
  it('should accept null', () => {
    // Act
    const r = filterAcknowledged(null);

    // Assert
    // tslint:disable-next-line:no-unused-expression
    expect(r).to.be.null;
  });

  it('should accept empty list', () => {
    // Arrange
    const m: Monitor.Host[] = [];

    // Act
    const r = filterAcknowledged(FHost.map(m));

    // Assert
    expect(r).to.have.lengthOf(0);
  });

  TestCaseBuilder
    .withEnabledFilter()
    .hostDownAcknowledged('H1')
    .shouldRemoveHost();

  TestCaseBuilder
    .withEnabledFilter()
    .hostDown('H1')
    .shouldKeepHost();

  TestCaseBuilder
    .withEnabledFilter()
    .hostUp('H1')
    .service('S1', 'OK')
    .shouldKeepHostWithService(); // the filter does not handle this

  TestCaseBuilder
    .withEnabledFilter()
    .hostDown('H1')
    .service('S1', 'OK')
    .shouldKeepHostWithService(); // the filter does not handle this

  TestCaseBuilder
    .withEnabledFilter()
    .hostDownAcknowledged('H1')
    .service('S1', 'OK')
    .shouldKeepHostWithService(); // the filter does not handle this

  ['WARNING', 'CRITIAL'].forEach((v: Monitor.ServiceState) => {

    TestCaseBuilder
      .withEnabledFilter()
      .hostUp('H1')
      .service('S1', v)
      .shouldKeepHostWithService();

    TestCaseBuilder
      .withEnabledFilter()
      .hostDown('H1')
      .service('S1', v)
      .shouldKeepHostWithService();

    TestCaseBuilder
      .withEnabledFilter()
      .hostDownAcknowledged('H1')
      .service('S1', v)
      .shouldKeepHostWithService();

    TestCaseBuilder
      .withEnabledFilter()
      .hostDown('H1')
      .service('S1', v, true)
      .shouldKeepHost();

    TestCaseBuilder
      .withEnabledFilter()
      .hostDownAcknowledged('H1')
      .service('S1', v, true)
      .shouldRemoveHost();
  });
});
