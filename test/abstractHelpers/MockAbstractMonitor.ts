import * as sinon from 'sinon';

import { AbstractMonitor } from '../../scripts/AbstractMonitor';
import { Monitor } from '../../scripts/MonitorData';
import { UICommand } from '../../scripts/UICommand';
import { IEnvironment } from '../../scripts/IEnvironment';
import { ImoinMonitorInstance } from '../../scripts/Settings';

export class MockAbstractMonitor extends AbstractMonitor {
  public defaultFetchStatusResponse = Promise.resolve(Monitor.ErrorMonitorData('Not implemented'));
  public fetchStatusSpy = sinon.stub().returns(this.defaultFetchStatusResponse);

  public init(environment: IEnvironment, settings: ImoinMonitorInstance, index: number) {
    environment.registerMonitorInstance(index, { instancelabel: 't1' });
    super.init(environment, settings, index);
  }

  fetchStatus(): Promise<Monitor.MonitorData> {
    return this.fetchStatusSpy();
  }

  handleUICommand(param: UICommand): void {
    throw new Error("Method not implemented.");
  }
}