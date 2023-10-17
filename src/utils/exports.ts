interface CsvExportOptions<T> {
  data: T[];
  skip: (keyof T)[];
  headers: Record<keyof T, string>;
  fileName: string;
  delimiter?: string;
}

export const exportCsv = <T>(props: CsvExportOptions<T>) => {
  const delimiter = props.delimiter ?? ',';

  const headerEntries = Object.entries(props.headers).filter(
    ([fieldName]) => !props.skip.includes(fieldName as keyof T)
  );

  const headerRow = headerEntries
    .map(([_fieldName, displayName]) => displayName)
    .join(delimiter);

  const csvContent = ['data:text/csv;charset=utf-8', headerRow];

  props.data.forEach((row) => {
    const out: string[] = [];

    headerEntries.forEach(([fieldName]) => {
      const value = row[fieldName as keyof T] as any;

      if (value instanceof Date) {
        out.push(value.toISOString());
      } else {
        out.push(value.toString());
      }
    });

    csvContent.push(out.join(delimiter));
  });

  const encodedUri = encodeURI(csvContent.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', props.fileName);
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};
