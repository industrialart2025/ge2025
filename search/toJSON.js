function toJson(filePath) {
    const rows = filePath.trim().split("\n");
    const headers = rows[0].split("\t");

    return rows.slice(1).map(row => {
        const values = row.split("\t");

        return headers.reduce((obj, header, index) => {
            let value = values[index]?.trim();
            if (value) {
                value = value.replace(/^["']|["']$/g, '').trim();
            }

            // ジャンルの場合、カンマまたは「、」で分割
            if (header === 'genre' && value) {
                obj[header] = value.split(/[,、]/)
            } else {
                obj[header] = value;
            }
            console.log("obj",obj);
            return obj;
        }, {});
    });
}