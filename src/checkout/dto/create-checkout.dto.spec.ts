import { createCheckoutSchema } from './create-checkout.dto.js';

describe('createCheckoutSchema', () => {
  it('accepts a positive quantity for a UUID product', () => {
    expect(
      createCheckoutSchema.parse({
        productId: 'b5871eb2-9b0d-4568-b17d-c453960e83b3',
        quantity: 5,
      }),
    ).toEqual({
      productId: 'b5871eb2-9b0d-4568-b17d-c453960e83b3',
      quantity: 5,
    });
  });

  it('rejects zero quantity', () => {
    expect(
      createCheckoutSchema.safeParse({
        productId: 'b5871eb2-9b0d-4568-b17d-c453960e83b3',
        quantity: 0,
      }).success,
    ).toBe(false);
  });
});
