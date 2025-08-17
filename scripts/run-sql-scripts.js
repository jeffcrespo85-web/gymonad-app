const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function runSqlScripts() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const scriptsDir = path.join(__dirname, "../scripts")
  const sqlFiles = fs
    .readdirSync(scriptsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()

  console.log("🚀 Running SQL migration scripts...")

  for (const file of sqlFiles) {
    console.log(`📄 Executing ${file}...`)

    const sqlContent = fs.readFileSync(path.join(scriptsDir, file), "utf8")

    try {
      const { error } = await supabase.rpc("exec_sql", { sql: sqlContent })

      if (error) {
        console.error(`❌ Error in ${file}:`, error.message)
        process.exit(1)
      } else {
        console.log(`✅ Successfully executed ${file}`)
      }
    } catch (err) {
      console.error(`❌ Failed to execute ${file}:`, err.message)
      process.exit(1)
    }
  }

  console.log("🎉 All SQL scripts executed successfully!")
}

runSqlScripts().catch(console.error)
