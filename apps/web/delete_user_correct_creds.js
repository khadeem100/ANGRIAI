const { Client } = require("pg");

const connectionString =
  "postgresql://neondb_owner:npg_Eq1GU8RypWBS@ep-flat-lake-ab28mjdi-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = new Client({
  connectionString,
});

async function main() {
  try {
    await client.connect();
    const res = await client.query('DELETE FROM "User" WHERE email = $1', [
      "it@gato.nl",
    ]);
    console.log("Deleted rows:", res.rowCount);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
