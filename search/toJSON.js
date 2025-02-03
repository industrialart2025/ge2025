const fs = require("node:fs")

// CSVをJSONに変換する関数
function csvToJson(filePath, delimiter = ",") {
  // ファイルを読み込む
  const csvString = fs.readFileSync(filePath, "utf-8")
  console.log(csvString)

  // 行を分割
  const rows = csvString.trim().split("\n")

  // ヘッダーを抽出
  const headers = rows[0].split(delimiter)

  // データをJSONに変換
  const json = rows.slice(1).map(row => {
    const values = row.split(delimiter)
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index]
      return obj
    }, {})
  })

  return json
}

// ファイルパスを指定
const filePath = "ge2025/search/testList.csv"

// CSVファイルをJSONに変換
const jsonResult = csvToJson(filePath)

// 結果を表示
console.log(jsonResult)

// JSONを新しいファイルに保存
fs.writeFileSync("ge2025/search/testList.json", JSON.stringify(jsonResult, null, 2), "utf-8")
console.log("JSONファイルが保存されました")
