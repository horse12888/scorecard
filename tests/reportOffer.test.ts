import assert from 'node:assert/strict';
import test from 'node:test';
import { reportOffer } from '../src/reportDecision';

test('la pagina risultato e il PDF scelgono la stessa offerta per fascia e intento', () => {
  const ranges = ['Sotto €100k', '€100k–€500k', '€500k–€1M', '€1M–€3M', '€3M–€10M', 'Oltre €10M'];
  for (const [idx, label] of ranges.entries()) {
    for (const intentLevel of [null, 0, 1, 2, 3]) {
      const expected = idx >= 1 || Number(intentLevel) >= 2 ? 'review' : 'kit';
      assert.equal(reportOffer({ answers: { Q2: { idx } }, intentLevel }), expected);
      assert.equal(reportOffer({ metadata: { revenueRange: label }, intentLevel }), expected);
      assert.equal(reportOffer({ answers: { Q2: { label } }, intentLevel }), expected);
    }
  }
});

test('i report privi della fascia usano soltanto l’intento dichiarato', () => {
  assert.equal(reportOffer({}), 'kit');
  assert.equal(reportOffer({ metadata: { revenueRange: 'Non indicato' } }), 'kit');
  assert.equal(reportOffer({ metadata: { intentLevel: '2' } }), 'review');
});
