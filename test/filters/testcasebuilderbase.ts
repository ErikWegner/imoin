import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { FilterSettings } from '../../scripts/Settings';
import { LoadCallbackBuilder } from '../abstractHelpers/LoadCallbackBuilder';
import { Monitor } from '../../scripts/monitors';
import { FHost } from '../../scripts/monitors/filters';
import { expect } from 'chai';
import { ServiceBuilder } from '../abstractHelpers/ServiceBuilder';

export abstract class TestCaseBuilderBase {
  protected hostStatus = 'UP';
  protected servicetext = '';
  protected b = new LoadCallbackBuilder();
  protected s: FilterSettings;
  protected flagText = '';
  protected abstract filter: (hosts: FHost[], filtersettings?: FilterSettings) => FHost[];

  constructor(enabled: boolean) {
    const sb = FilterSettingsBuilder
      .plain();
    if (enabled) {
      this.enable(sb);
    }
    this.s = sb.build();
  }

  public hostUp(name: string) {
    this.b.Host(name);
    return this;
  }

  public hostDown(name: string) {
    this.hostDownWithIndicatorFlag(name, false);
    return this;
  }

  public hostDownAndFilterIndicatorIsSet(hostname: string) {
    this.hostDownWithIndicatorFlag(hostname, true);
    return this;
  }

  public service(name: string, state: Monitor.ServiceState, setIndicatorFlag = false) {
    this.servicetext = state + ' service';
    this.b.Service(name, (sb) => {
      sb.withStatus(state);
      if (setIndicatorFlag) {
        this.servicetext = this.generateServiceTextWhenFilterIndicatorIsSet();
        this.setServiceFilterIndicator(sb);
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

  protected abstract enable(sb: FilterSettingsBuilder): void;
  protected abstract setFlagTextAndFilterIndicatorOnHost(): void;
  protected abstract generateServiceTextWhenFilterIndicatorIsSet(): string;
  protected abstract setServiceFilterIndicator(sb: ServiceBuilder): void;

  protected runTest(keepHost: boolean, keepService: boolean) {
    const verbHost = keepHost ? 'keep' : 'remove';
    const verbService = keepService ? 'keep' : 'remove';
    const expectedHosts = keepHost ? 1 : 0;
    const expectedServices = keepService ? 1 : 0;
    let testText = 'should ' + verbHost + ' ' + this.hostStatus + ' host';
    if (this.flagText !== '') {
      testText += ' ' + this.flagText;
    }
    if (this.servicetext !== '') {
      testText += ' and ' + verbService + ' ' + this.servicetext;
    }
    it(testText, () => {
      const m = this.b.GetHosts();

      // Act
      const r = this.filter(FHost.map(m), this.s);

      // Assert
      expect(r).to.have.lengthOf(expectedHosts, 'number of hosts');
      if (r.length > 0) {
        expect(r[0].getFServices()).to.have.lengthOf(expectedServices, 'number of services');
      }
    });
  }

  private hostDownWithIndicatorFlag(name: string, shouldSetFilterIndicator: boolean) {
    this.hostStatus = 'DOWN';
    this.b
      .Host(name)
      .Down()
      ;
    if (shouldSetFilterIndicator) {
      this.setFlagTextAndFilterIndicatorOnHost();
    }

    return this;
  }
}
