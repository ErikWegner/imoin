import * as sinon from 'sinon';

import { Monitor, AbstractMonitor } from '../../scripts/monitors';

import { UICommand } from '../../scripts/UICommand';
import { IEnvironment } from '../../scripts/IEnvironment';
import { ImoinMonitorInstance } from '../../scripts/Settings';

export class MockAbstractMonitor extends AbstractMonitor {
  public defaultFetchStatusResponse = Promise.resolve(Monitor.ErrorMonitorData('Not implemented'));
  public fetchStatusSpy = sinon.stub().returns(this.defaultFetchStatusResponse);

  constructor(environment: IEnvironment, settings: ImoinMonitorInstance, index: number) {
    environment.registerMonitorInstance(index, { instancelabel: 't1' });
    super(environment, settings, index);
  }

  public fetchStatus(): Promise<Monitor.MonitorData> {
    return this.fetchStatusSpy();
  }

  protected handleUICommand(param: UICommand): void {
    throw new Error('Method not implemented.');
  }
}
