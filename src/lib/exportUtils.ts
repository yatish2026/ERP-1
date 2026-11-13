/**
 * Utility functions for exporting data to CSV and downloading reports.
 */

export function exportToCsv(
  filename: string, 
  headers: string[], 
  rows: (string | number | boolean | null | undefined)[][]
) {
  const sanitizeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const csvRows: string[] = [];
  
  // Header row
  csvRows.push(headers.map(h => sanitizeCell(h)).join(','));

  // Data rows
  for (const row of rows) {
    csvRows.push(row.map(cell => sanitizeCell(cell)).join(','));
  }

  const csvString = csvRows.join('\r\n');
  // Include UTF-8 Byte Order Mark (BOM) for seamless Excel & Google Sheets opening
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
