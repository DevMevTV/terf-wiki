import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function generateCategoryIndex(category: string) {
  const categoryPath = path.resolve(__dirname, "public", "data", category);

  const jsons = fs.readdirSync(categoryPath)
    .filter(file => file.endsWith(".json"))
    .map(file => {
      const id = file.replace(".json", "").replace("\\", "/");
      const data = JSON.parse(fs.readFileSync(path.join(categoryPath, file), "utf-8"));

      return {
        id,
        name: data.name
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name));
      
  fs.writeFileSync(
    path.join(__dirname, "public", "data", `${category}.json`),
    JSON.stringify(jsons, null, 2)
   )
}

function generateIndexes() {
  return {
    name: "generate-indexes",

    buildStart() {
      generateCategoryIndex("items");
      generateCategoryIndex("machines");
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    generateIndexes(),
  ],
  base: "/terf-wiki/",
})
