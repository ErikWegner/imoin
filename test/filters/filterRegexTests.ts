import { expect } from "chai";
import { Monitor } from "../../scripts/monitors";
import { FHost } from "../../scripts/monitors/filters";
import { filterHostsByRegex } from "../../scripts/monitors/filters/filterRegex";
import { FilterSettingsBuilder } from "../abstractHelpers/FilterSettingsBuilder";

describe('Filter regex', () => {
  describe('Hosts', () => {
    it('Should accept empty list', () => {
      // Arrage
      const m: Monitor.Host[] = [];

      // Act
      const r = filterHostsByRegex(FHost.map(m));

      // Assert
      expect(r).to.eql([]);
    });

    it('Should keep host', () => {
      // Arrage
      const m = ['hjp1', 'hkp1', 'hji1', 'hjp2'].map(name => new Monitor.Host(name));
      const s = FilterSettingsBuilder.plain().filterKeepByRegexHost(/hj.\d/).build();

      // Act
      const r = filterHostsByRegex(FHost.map(m), s);

      // Assert
      expect(r).to.be.an('array').with.lengthOf(3);
      expect(r.map(x => x.getHost().name)).to.eql(['hjp1', 'hji1', 'hjp2']);
    });


    it('Should remove host', () => {
      // Arrage
      const m = ['hjp1', 'hkp1', 'hji1', 'hjp2'].map(name => new Monitor.Host(name));
      const s = FilterSettingsBuilder.plain().filterRemoveByRegexHost(/h.p1/).build();

      // Act
      const r = filterHostsByRegex(FHost.map(m), s);

      // Assert
      expect(r).to.be.an('array').with.lengthOf(2);
      expect(r.map(x => x.getHost().name)).to.eql(['hji1', 'hjp2']);
    });
  });

  describe('Services', () => {

  });
});

