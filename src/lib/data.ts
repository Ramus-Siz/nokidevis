// src/lib/data.ts

import { Quotation, QuotationStatus } from '@/types'; // Ensure correct path for your types
import { readData, writeData } from '@/lib/fileDb'; // Your generic file DB helpers

const quotationsFileName = 'quotations.json'; // Make sure this matches your actual file name

/**
 * Updates the status of a specific quotation in the data store.
 * @param id The ID of the quotation to update.
 * @param newStatus The new status to set for the quotation.
 * @returns The updated Quotation object, or null if the quotation is not found.
 */
export async function updateQuotationStatus(id: string, newStatus: QuotationStatus): Promise<Quotation | null> {
  let quotations = await readData<Quotation>(quotationsFileName);
  const index = quotations.findIndex(q => q.id === id);

  if (index === -1) {
    return null; // Quotation not found
  }

  // Update the status and a timestamp
  quotations[index].status = newStatus;
  quotations[index].last_updated = new Date().toISOString();

  await writeData<Quotation>(quotationsFileName, quotations);
  return quotations[index]; // Return the updated quotation
}

