import { createProductSchema } from './create-product.dto.js';

describe('createProductSchema', () => {
  const validProduct = {
    title: 'Rustic ceramic mug',
    description: 'Hand-finished stoneware mug.',
    priceMinor: 2499,
    brand: 'Rustic',
    colour: '#8b5e3c',
    currency: 'eur',
    category: 'Home',
  };

  it('normalizes ISO currency while preserving a validated product', () => {
    expect(createProductSchema.parse(validProduct)).toMatchObject({
      currency: 'EUR',
      colour: '#8b5e3c',
    });
  });

  it('rejects invalid colour and money values', () => {
    expect(
      createProductSchema.safeParse({ ...validProduct, colour: 'brown' })
        .success,
    ).toBe(false);
    expect(
      createProductSchema.safeParse({ ...validProduct, priceMinor: -1 })
        .success,
    ).toBe(false);
  });
});
