export async function generateInsertQuery(tableName: string, columns: any) {
  const columnNames = Object.keys(columns);
  const columnValues = Object.values(columns);

  const values = columnValues.map((value) => `'${value}'`).join(", ");
  const query = `INSERT INTO ${tableName} (${columnNames.join(
    ", "
  )}) VALUES (${values})`;

  return query;
}
