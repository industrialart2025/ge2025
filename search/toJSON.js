// ge2025/search/toJSON.js

function csvToJson(csvString, delimiter = ",") {
    // 行を分割
    const rows = csvString.trim().split("\n");

    // ヘッダーを抽出
    const headers = rows[0].split(delimiter);

    // データをJSONに変換
    return rows.slice(1).map(row => {
        const values = row.split(delimiter);
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
}
