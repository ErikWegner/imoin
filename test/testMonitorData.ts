import { expect } from 'chai';
import 'mocha';

import { FHost } from '../scripts/monitors/filters';
import { Host, MonitorData, Service, Status } from './monitors';

describe('MonitorData', () => {
  it('updateCounters: no filtered host array ⇒ still green', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    m.addHost(host);
    host.setState('UP');

    // Act
    m.updateCounters();

    // Assert
    expect(m.getFilteredState()).to.equal(Status.GREEN);
  });

  it('updateCounters: no filtered host array ⇒ still red', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    m.addHost(host);
    host.setState('DOWN');

    // Act
    m.updateCounters();

    // Assert
    expect(m.getFilteredState()).to.equal(Status.RED);
  });

  it('updateCounters: host with ok service, no filtered host array ⇒ still red', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    host.addService(service);
    m.addHost(host);
    host.setState('UP');
    service.setState('OK');

    // Act
    m.updateCounters();

    // Assert
    expect(m.getFilteredState()).to.equal(Status.GREEN);
  });

  it('updateCounters: host with warning service, no filtered host array ⇒ still red', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    host.addService(service);
    m.addHost(host);
    host.setState('UP');
    service.setState('WARNING');

    // Act
    m.updateCounters();

    // Assert
    expect(m.getFilteredState()).to.equal(Status.YELLOW);
  });

  it('updateCounters: host with critical service, no filtered host array ⇒ still red', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    host.addService(service);
    m.addHost(host);
    host.setState('UP');
    service.setState('CRITICAL');

    // Act
    m.updateCounters();

    // Assert
    expect(m.getFilteredState()).to.equal(Status.RED);
  });

  it('updateCounters: host up in filtered host array ⇒ still green', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const fhost = new FHost(host);
    const fhosts: FHost[] = [];
    m.addHost(host);
    fhosts.push(fhost);
    host.setState('UP');

    // Act
    m.updateCounters(fhosts);

    // Assert
    expect(m.filteredHosterrors).to.equal(0);
    expect(m.filteredServiceerrors).to.equal(0);
    expect(m.filteredServicewarnings).to.equal(0);
    expect(m.getFilteredState()).to.equal(Status.GREEN);
  });

  it('updateCounters: host in filtered host array ⇒ still red', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const fhost = new FHost(host);
    const fhosts: FHost[] = [];
    m.addHost(host);
    fhosts.push(fhost);
    host.setState('DOWN');

    // Act
    m.updateCounters(fhosts);

    // Assert
    expect(m.getFilteredState()).to.equal(Status.RED);
  });

  it('updateCounters: host not in filtered host array ⇒ green', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const fhosts: FHost[] = [];
    m.addHost(host);
    host.setState('DOWN');

    // Act
    m.updateCounters(fhosts);

    // Assert
    expect(m.getFilteredState()).to.equal(Status.GREEN);
  });

  it('updateCounters: host with critical service in filtered host array ⇒ still red', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    host.addService(service);
    const fhost = new FHost(host);
    const fhosts: FHost[] = [];
    m.addHost(host);
    fhosts.push(fhost);
    host.setState('UP');
    service.setState('CRITICAL');

    // Act
    m.updateCounters(fhosts);

    // Assert
    expect(m.getFilteredState()).to.equal(Status.RED);
  });

  it('updateCounters: host with warning service in filtered host array ⇒ still yellow', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    host.addService(service);
    const fhost = new FHost(host);
    const fhosts: FHost[] = [];
    m.addHost(host);
    fhosts.push(fhost);
    host.setState('UP');
    service.setState('WARNING');

    // Act
    m.updateCounters(fhosts);

    // Assert
    expect(m.getFilteredState()).to.equal(Status.YELLOW);
  });

  it('updateCounters: host up with ok service in filtered host array ⇒ still green', () => {
    // Arrange
    const m = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    host.addService(service);
    const fhost = new FHost(host);
    const fhosts: FHost[] = [];
    m.addHost(host);
    fhosts.push(fhost);
    host.setState('UP');
    service.setState('OK');

    // Act
    m.updateCounters(fhosts);

    // Assert
    expect(m.getFilteredState()).to.equal(Status.GREEN);
  });
});
