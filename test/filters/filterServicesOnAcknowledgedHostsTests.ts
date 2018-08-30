import 'mocha';
import { expect } from 'chai';
import { filterServicesOnAcknowledgedHosts, FHost } from '../../scripts/monitors/filters';
import { Monitor } from '../../scripts/monitors/MonitorData';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';

describe('Filters', () => {
  describe('filterServicesOnAcknowledgedHosts', () => {
    const filterSettings = FilterSettingsBuilder
      .plain()
      .filterOutServicesOnAcknowledgedHosts()
      .build();

    it('should accept null', () => {
      // Act
      const r = filterServicesOnAcknowledgedHosts(null);

      // Assert
      // tslint:disable-next-line:no-unused-expression
      expect(r).to.be.null;
    });

    it('should accept empty list', () => {
      // Arrange
      const m: Monitor.Host[] = [];

      // Act
      const r = filterServicesOnAcknowledgedHosts(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    it('should keep UP host with no service', () => {
      // Arrange
      const host1 = new Monitor.Host('H1');
      host1.setState('UP');
      const m: Monitor.Host[] = [];
      m.push(host1);

      // Act
      const r = filterServicesOnAcknowledgedHosts(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.have.lengthOf(1);
    });

    it('should keep DOWN host with no service', () => {
      // Arrange
      const host1 = new Monitor.Host('H1');
      host1.setState('DOWN');
      const m: Monitor.Host[] = [];
      m.push(host1);

      // Act
      const r = filterServicesOnAcknowledgedHosts(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.have.lengthOf(1);
    });

    const hostStates: Monitor.HostState[] = ['UP', 'DOWN'];
    const serviceStates: Monitor.ServiceState[] = ['OK', 'WARNING', 'CRITICAL'];

    hostStates.forEach((hostState) => {
      serviceStates.forEach((serviceState) => {
        it('should keep ' + hostState + ' host with service ' + serviceState, () => {
          // Arrange
          const service1 = new Monitor.Service('S1');
          service1.setState(serviceState);
          const host1 = new Monitor.Host('H1');
          host1.setState(hostState);
          host1.addService(service1);
          const m: Monitor.Host[] = [];
          m.push(host1);

          // Act
          const r = filterServicesOnAcknowledgedHosts(FHost.map(m), filterSettings);

          // Assert
          expect(r).to.have.lengthOf(1);
          expect(r[0].getFServices()).to.have.lengthOf(1);
        });

        it('should keep ' + hostState + ' host with ack flag with service ' +
          serviceState + ' and remove service', () => {
            // Arrange
            const service1 = new Monitor.Service('S1');
            service1.setState(serviceState);
            const host1 = new Monitor.Host('H1');
            host1.setState(hostState);
            host1.hasBeenAcknowledged = true;
            host1.addService(service1);
            const m: Monitor.Host[] = [];
            m.push(host1);

            // Act
            const r = filterServicesOnAcknowledgedHosts(FHost.map(m), filterSettings);

            // Assert
            expect(r).to.have.lengthOf(1);
            expect(r[0].getFServices()).to.have.lengthOf(0);
          });
      });
    });
  });
});
