import { expect } from 'chai';
import { FHost } from '../../scripts/monitors/filters';
import { filterHostsByRegex, filterResponseByRegex } from '../../scripts/monitors/filters/filterRegex';
import { FilterSettingsBuilder } from '../abstractHelpers/FilterSettingsBuilder';
import { HostBuilder } from '../abstractHelpers/HostBuilder';
import { Host } from '../monitors';

describe('Filter regex', () => {
  describe('Hosts', () => {
    it('Should accept empty list', () => {
      // Arrage
      const m: Host[] = [];

      // Act
      const r = filterHostsByRegex(FHost.map(m));

      // Assert
      expect(r).to.eql([]);
    });

    it('Should keep host', () => {
      // Arrage
      const m = ['hjp1', 'hkp1', 'hji1', 'hjp2'].map(name => new Host(name));
      const s = FilterSettingsBuilder.plain().filterKeepByRegexHost('hj.d').build();

      // Act
      const r = filterHostsByRegex(FHost.map(m), s);

      // Assert
      expect(r).to.be.an('array').with.lengthOf(3);
      expect(r.map(x => x.getHost().name)).to.eql(['hjp1', 'hji1', 'hjp2']);
    });


    it('Should remove host', () => {
      // Arrage
      const m = ['hjp1', 'hkp1', 'hji1', 'hjp2'].map(name => new Host(name));
      const s = FilterSettingsBuilder.plain().filterRemoveByRegexHost('h.p1').build();

      // Act
      const r = filterHostsByRegex(FHost.map(m), s);

      // Assert
      expect(r).to.be.an('array').with.lengthOf(2);
      expect(r.map(x => x.getHost().name)).to.eql(['hji1', 'hjp2']);
    });
  });

  describe('Reponse', () => {
    it('should accept empty response', () => {
      // Arrage
      const m = <Host[]>[];

      // Act
      const r = filterResponseByRegex(FHost.map(m));

      // Assert
      expect(r).to.eql([]);
    });

    it('should keep', () => {
      // Arrage
      const filterSettings = FilterSettingsBuilder
        .plain()
        .filterKeepByRegexHost('^keep')
        .filterKeepByRegexService('^keepservice')
        .build();
      const m = <Host[]>[];
      m.push(new HostBuilder().Host('keep1').Down().Service('keepservice1', () => { /* no-op */ }).Done());
      m.push(new HostBuilder().Host('drop1').Down().Service('keepservice2', () => { /* no-op */ }).Done());
      m.push(new HostBuilder().Host('keep2').Down().Service('keepservice3', () => { /* no-op */ }).Service('keepservice4', () => { /* no-op */ }).Service('dropservice5', () => { /* no-op */ }).Done());
      m.push(new HostBuilder().Host('keep3').Down().Service('dropservice5', () => { /* no-op */ }).Done());

      // Act
      const r = filterResponseByRegex(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.be.an('array').with.lengthOf(2);
      expect(r[0].getFServices().map(s => s.name)).to.eql(['keepservice1']);
      expect(r[1].getFServices().map(s => s.name)).to.eql(['keepservice3', 'keepservice4']);
    });

    it('should drop', () => {
      // Arrage
      const filterSettings = FilterSettingsBuilder
        .plain()
        .filterRemoveByRegexHost('^drop')
        .filterRemoveByRegexService('^dropservice')
        .build();
      const m = <Host[]>[];
      m.push(new HostBuilder().Host('keep1').Down().Service('keepservice1', () => { /* no-op */ }).Done());
      m.push(new HostBuilder().Host('drop1').Down().Service('keepservice2', () => { /* no-op */ }).Done());
      m.push(new HostBuilder().Host('keep2').Down().Service('keepservice3', () => { /* no-op */ }).Service('keepservice4', () => { /* no-op */ }).Service('dropservice5', () => { /* no-op */ }).Done());
      m.push(new HostBuilder().Host('keep3').Down().Service('dropservice5', () => { /* no-op */ }).Done());

      // Act
      const r = filterResponseByRegex(FHost.map(m), filterSettings);

      // Assert
      expect(r).to.be.an('array').with.lengthOf(2);
      expect(r[0].getFServices().map(s => s.name)).to.eql(['keepservice1']);
      expect(r[1].getFServices().map(s => s.name)).to.eql(['keepservice3', 'keepservice4']);
    });
  });
});
