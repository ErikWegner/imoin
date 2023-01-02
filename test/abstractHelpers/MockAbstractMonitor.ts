import * as sinon from 'sinon';

import { IEnvironment } from '../../scripts/IEnvironment';
import {
  AbstractMonitor,
  ErrorMonitorData,
  MonitorData,
} from '../../scripts/monitors';
import { ImoinMonitorInstance } from '../../scripts/Settings';
import { UICommand } from '../../scripts/UICommand';

export class MockAbstractMonitor extends AbstractMonitor {
  public defaultFetchStatusResponse = Promise.resolve(
    ErrorMonitorData('Not implemented')
  );
  public fetchStatusSpy = sinon
    .stub<[], Promise<MonitorData>>()
    .returns(this.defaultFetchStatusResponse);

  constructor(
    environment: IEnvironment,
    settings: ImoinMonitorInstance,
    index: number
  ) {
    environment.registerMonitorInstance(index, { instancelabel: 't1' });
    super(environment, settings, index);
  }

  public fetchStatus(): Promise<MonitorData> {
    return this.fetchStatusSpy();
  }

  protected handleUICommand(_param: UICommand): void {
    throw new Error('Method not implemented.');
  }
}
