import 'mocha';
import { expect } from 'chai';

import { filterUp, FHost } from '../../scripts/monitors/filters';
import { Host, Service } from '../monitors';

describe('Filters', () => {
  describe('filterUP', () => {
    it('should accept null', () => {
      // Act
      const r = filterUp(null);

      // Assert
      expect(r).to.be.null;
    });

    it('should accept empty list', () => {
      // Arrange
      const m: Host[] = [];

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    it('should remove UP host with no service', () => {
      // Arrange
      const host1 = new Host('H1');
      host1.setState('UP');
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    it('should keep DOWN host with no service', () => {
      // Arrange
      const host1 = new Host('H1');
      host1.setState('DOWN');
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(1);
    });

    it('should remove UP host with service OK', () => {
      // Arrange
      const service1 = new Service('S1');
      service1.setState('OK');
      const host1 = new Host('H1');
      host1.setState('UP');
      host1.addService(service1);
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(0);
    });

    it('should keep UP host with service WARNING', () => {
      // Arrange
      const service1 = new Service('S1');
      service1.setState('WARNING');
      const host1 = new Host('H1');
      host1.setState('UP');
      host1.addService(service1);
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(1);
      if (r) {
        expect(r[0].getFServices()).to.have.lengthOf(1);
      }
    });

    it('should keep UP host with service CRITICAL', () => {
      // Arrange
      const service1 = new Service('S1');
      service1.setState('CRITICAL');
      const host1 = new Host('H1');
      host1.setState('UP');
      host1.addService(service1);
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(1);
      if (r) {
        expect(r[0].getFServices()).to.have.lengthOf(1);
      }
    });

    it('should keep DOWN host with service OK', () => {
      // Arrange
      const service1 = new Service('S1');
      service1.setState('OK');
      const host1 = new Host('H1');
      host1.setState('DOWN');
      host1.addService(service1);
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(1);
      if (r) {
        expect(r[0].getFServices()).to.have.lengthOf(0);
      }
    });

    it('should keep UP host with service WARNING and remove SERVICE OK', () => {
      // Arrange
      const service1 = new Service('S1');
      service1.setState('WARNING');
      const service2 = new Service('S2');
      service2.setState('OK');
      const host1 = new Host('H1');
      host1.setState('UP');
      host1.addService(service1);
      host1.addService(service2);
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(1);
      if (r) {
        expect(r[0].getFServices()).to.have.lengthOf(1);
      }
    });

    it('should keep UP host with service CRITICAL and remove SERVICE OK', () => {
      // Arrange
      const service1 = new Service('S1');
      service1.setState('CRITICAL');
      const service2 = new Service('S2');
      service2.setState('OK');
      const host1 = new Host('H1');
      host1.setState('UP');
      host1.addService(service1);
      host1.addService(service2);
      const m: Host[] = [];
      m.push(host1);

      // Act
      const r = filterUp(FHost.map(m));

      // Assert
      expect(r).to.have.lengthOf(1);
      if (r) {
        expect(r[0].getFServices()).to.have.lengthOf(1);
      }
    });
  });
});
