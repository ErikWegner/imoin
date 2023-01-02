import 'mocha';
import { expect } from 'chai';

import {
  filterServicesOnDownHosts,
  FHost,
} from '../../scripts/monitors/filters';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { Host, Service, ServiceState } from '../monitors';

describe('Filters', () => {
  describe('filterServicesOnDownHosts', () => {
    const filterSettings = FilterSettingsBuilder
      .plain()
      .filterOutServicesOnDownHosts()
      .build();

    it('should accept null', () => {
      // Act
      const r = filterServicesOnDownHosts(null);

      // Assert
      expect(r).to.be.null;
    });

    it('should accept empty list', () => {
      // Arrange
      const m: Host[] = [];

      // Act
      const r = filterServicesOnDownHosts(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    it('should keep UP host with no service', () => {
      // Arrange
      const host1 = new Host('H1');
      host1.setState('UP');
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterServicesOnDownHosts(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.have.lengthOf(1);
    });

    it('should keep DOWN host with no service', () => {
      // Arrange
      const host1 = new Host('H1');
      host1.setState('DOWN');
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterServicesOnDownHosts(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.have.lengthOf(1);
    });

    const serviceStates: ServiceState[] = ['OK', 'WARNING', 'CRITICAL'];
    serviceStates.forEach((serviceState) => {
      it('should keep UP host with service ' + serviceState, () => {
        // Arrange
        const service1 = new Service('S1');
        service1.setState(serviceState);
        const host1 = new Host('H1');
        host1.setState('UP');
        host1.addService(service1);
        const m: Host[] = [];
        m.push(host1);

        // Act
        const r = filterServicesOnDownHosts(FHost.map(m), filterSettings);

        // Assert
        expect(r).to.have.lengthOf(1);
        if (r) {
          expect(r[0].getFServices()).to.have.lengthOf(1);
        }
      });

      it(
        'should keep DOWN host with service ' +
          serviceState +
          ' and remove service',
        () => {
          // Arrange
          const service1 = new Service('S1');
          service1.setState(serviceState);
          const host1 = new Host('H1');
          host1.setState('DOWN');
          host1.addService(service1);
          const m: Host[] = [];
          m.push(host1);

          // Act
          const r = filterServicesOnDownHosts(FHost.map(m), filterSettings);

          // Assert
          expect(r).to.have.lengthOf(1);
          if (r) {
            expect(r[0].getFServices()).to.have.lengthOf(0);
          }
        }
      );
    });
  });
});
