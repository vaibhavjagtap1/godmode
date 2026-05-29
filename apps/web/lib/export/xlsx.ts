import * as XLSX from 'xlsx';

export const exportXlsx = (title: string, sections: Record<string, unknown>) => {
  const wb = XLSX.utils.book_new();

  for (const [name, value] of Object.entries(sections)) {
    const rows = Array.isArray(value) ? value : [value];
    const ws = XLSX.utils.json_to_sheet(rows as object[]);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }

  XLSX.writeFile(wb, `${title}.xlsx`);
};
