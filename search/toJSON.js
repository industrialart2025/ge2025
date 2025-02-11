function toJson(filePath) {
    // 行を分割
    const rows = filePath.trim().split("\n");

    // ヘッダーを通常のカンマで分割
    const headers = rows[0].split("\t");

    // データをJSONに変換
    return rows.slice(1).map(row => {
        // 最初にカンマで分割
        const values = row.split("\t");
        
        // title列（インデックスを適切な位置に調整）のために
        // // その要素をタブで分割して処理
        headers.forEach((header, index) => {
            if (header === 'genre') {
                // この列の値にタブが含まれている場合、タブで分割して最初の要素を使用
                values[index] = values[index]?.split(",")[0] || values[index];
            }
        });

        return headers.reduce((obj, header, index) => {
            // 値から引用符を削除
            let value = values[index];
            if (value) {
                // 前後の引用符を削除
                value = value.replace(/^["']|["']$/g, '');
                // 余分な空白を削除
                value = value.trim();
            }
            obj[header] = value;
            return obj;
        }, {});
    });
}