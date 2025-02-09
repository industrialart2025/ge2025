function csvToJson(csvString, delimiter = ",") {
    // 行を分割
    const rows = csvString.trim().split("\n");

    // ヘッダーを抽出
    const headers = rows[0].split(delimiter);

    // データをJSONに変換
    return rows.slice(1).map(row => {
        const values = row.split(delimiter);
        return headers.reduce((obj, header, index) => {
            // 値から引用符を削除
            let value = values[index];
            if (value) {
                // 前後の引用符を削除
                value = value.replace(/^["']|["']$/g, '');
            }
            obj[header] = value;
            return obj;
        }, {});
    });
}