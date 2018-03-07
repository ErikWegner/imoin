import * as sinon from 'sinon';

import { AbstractMonitor } from '../../scripts/AbstractMonitor';
import { Monitor } from '../../scripts/MonitorData';
import { UICommand } from '../../scripts/UICommand';

export class MockAbstractMonitor extends AbstractMonitor {
  public defaultFetchStatusResponse = Promise.resolve(Monitor.ErrorMonitorData('Not implemented'));
  public fetchStatusSpy = sinon.stub().returns(this.defaultFetchStatusResponse);

  fetchStatus(): Promise<Monitor.MonitorData> {
    return this.fetchStatusSpy();
  }

  handleUICommand(param: UICommand): void {
    throw new Error("Method not implemented.");
  }
}