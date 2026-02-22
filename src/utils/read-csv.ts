import { createReadStream } from 'node:fs';

import * as csvParser from 'csv-parser';

export const readCsv = async (filePath: string) => {
  const rows: Record<string, string | null>[] = [];

  await new Promise<void>((resolvePromise, reject) => {
    createReadStream(filePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim(),
        }),
      )
      .on('data', (row: Record<string, string | null>) => {
        Object.keys(row).forEach((key) => {
          if (row[key] === 'NULL') {
            row[key] = null;
          }
        });

        rows.push(row);
      })
      .on('end', () => {
        resolvePromise();
      })
      .on('error', reject);
  });

  return rows;
};
