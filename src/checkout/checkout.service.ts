import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { checkoutItems, checkouts, products } from '../database/schema.js';
import type { CreateCheckoutDto } from './dto/create-checkout.dto.js';
import type { CheckoutResponse, CheckoutStatus } from './checkout.types.js';

@Injectable()
export class CheckoutService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(
    input: CreateCheckoutDto,
    idempotencyKey: string,
  ): Promise<CheckoutResponse> {
    const requestFingerprint = fingerprint(input);

    return this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(checkouts)
        .where(eq(checkouts.idempotencyKey, idempotencyKey));

      if (existing) {
        if (existing.requestFingerprint !== requestFingerprint) {
          throw new ConflictException(
            'This idempotency key was used for a different request.',
          );
        }
        return this.findOneWithItems(existing.id, tx);
      }

      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, input.productId));
      if (!product) {
        throw new NotFoundException(`Product ${input.productId} was not found`);
      }

      const [checkout] = await tx
        .insert(checkouts)
        .values({ idempotencyKey, requestFingerprint })
        .onConflictDoNothing({ target: checkouts.idempotencyKey })
        .returning();

      if (!checkout) {
        const [concurrentCheckout] = await tx
          .select()
          .from(checkouts)
          .where(eq(checkouts.idempotencyKey, idempotencyKey));

        if (!concurrentCheckout) {
          throw new ConflictException(
            'Unable to create checkout; please retry.',
          );
        }
        if (concurrentCheckout.requestFingerprint !== requestFingerprint) {
          throw new ConflictException(
            'This idempotency key was used for a different request.',
          );
        }
        return this.findOneWithItems(concurrentCheckout.id, tx);
      }

      const [item] = await tx
        .insert(checkoutItems)
        .values({
          checkoutId: checkout.id,
          productId: product.id,
          titleSnapshot: product.title,
          unitPriceMinor: product.priceMinor,
          currency: product.currency,
          quantity: input.quantity,
        })
        .returning();

      return {
        id: checkout.id,
        status: checkout.status,
        createdAt: checkout.createdAt,
        items: [toItem(item)],
      };
    });
  }

  private async findOneWithItems(
    id: string,
    tx: Database,
  ): Promise<CheckoutResponse> {
    const [checkout] = await tx
      .select()
      .from(checkouts)
      .where(eq(checkouts.id, id));
    const items = await tx
      .select()
      .from(checkoutItems)
      .where(eq(checkoutItems.checkoutId, id));

    if (!checkout) {
      throw new NotFoundException(`Checkout ${id} was not found`);
    }

    return {
      id: checkout.id,
      status: checkout.status as CheckoutStatus,
      createdAt: checkout.createdAt,
      items: items.map(toItem),
    };
  }
}

function fingerprint(input: CreateCheckoutDto): string {
  return createHash('sha256')
    .update(`${input.productId}:${input.quantity}`)
    .digest('hex');
}

function toItem(item: typeof checkoutItems.$inferSelect) {
  return {
    productId: item.productId,
    title: item.titleSnapshot,
    unitPriceMinor: item.unitPriceMinor,
    currency: item.currency,
    quantity: item.quantity,
  };
}
