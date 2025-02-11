//画像URL_IDを抜粋する関数
function extractFileId(url) {
    const regex = /\/d\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

//tsvをjsonに変換する関数
async function getJson(filePath) {
    try {
        // tsvをJSONに変換
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tsvString = await response.text();
        const jsonResult = toJson(tsvString);
        console.log(jsonResult);

        return jsonResult
    } catch (error) {
        console.error("エラー:", error);
    }
}

//jsonからli要素を描画する関数
function htmlToElement(json) {
    const eachItem = document.querySelector(".test-titles");

    eachItem.innerHTML = ''; // 親要素内の子要素をすべて削除

    // 検索結果の表示
    const jsonLength = json.length; 
    const searchResult = document.createElement("h3");
    searchResult.textContent = `検索結果:${jsonLength}件`;
    eachItem.appendChild(searchResult); 

    // リストに追加
    json.map(item => {
        const listItem = document.createElement("li");
        listItem.textContent = `タイトル:${item.title}`; // JSONデータのプロパティに合わせて修正
        eachItem.appendChild(listItem);

        const studioItem = document.createElement("li");
        studioItem.textContent = `スタジオ:${item.studio}`; // JSONデータのプロパティに合わせて修正
        eachItem.appendChild(studioItem);

        const genreItem = document.createElement("li");
        genreItem.textContent = `ジャンル:${item.genre}`; // JSONデータのプロパティに合わせて修正
        eachItem.appendChild(genreItem);

        const link = document.createElement("a");
        link.href = item.notion_URL
        link.target = "_blank";
        link.textContent = "くわしく見る";
        eachItem.appendChild(link);
        

        const imgItem = document.createElement("img")
        const fileId = extractFileId(item.image); // 画
        imgItem.src = `https://lh3.google.com/u/0/d/${fileId}`; // 画像のURLを設定
        eachItem.appendChild(imgItem);

    });
}

let selectedKey = "studio";
let currentFilter = null;

//スタジオまたは、ジャンルを選択するボタンを作成する関数
function selectChangeEither(selectKeys) {
    const filterContainer = document.querySelector('.button-container');
    document.body.appendChild(filterContainer);

    const filterItem = ["studio", "genre"]
    
    filterItem.map(key => {
        const select = document.createElement("button");
        select.textContent = key;
        select.addEventListener("click", () => {
            //デバッグログ
            selectedKey = key;
            updateSecondaryButtons();
        });
        filterContainer.appendChild(select);
    })

    //初期状態ではスタジオを選択
    selectedKey = "studio"
    updateSecondaryButtons();

}

//スタジオ及び、ジャンルの各値を選択するボタンを作成する関数
function selectChangeDetail(selectList) {
    const container = document.querySelector('.button-container-secondary');
   
    container.innerHTML = ''; // 前のボタンをクリア   

    // すべて表示ボタンを追加
    const allButton = document.createElement("button");
    allButton.textContent = "すべて表示";
    allButton.addEventListener("click", () => {
        currentFilter = null;
        updateArticleList();
    });
    container.appendChild(allButton);

    // フィルター用ボタンを追加
    selectList.map(value => {
        const button = document.createElement("button");
        button.textContent = value;
        button.addEventListener("click", () => {
            currentFilter = value;
            updateArticleList();
        });
        container.appendChild(button);
    });
}

// 重複を削除する関数（ジャンルが配列の場合も対応）
function listSet(json, key) {
    if (!key) return [];

    const list = json.flatMap(item => 
        Array.isArray(item[key]) ? item[key] : [item[key]]
    );

    return [...new Set(list)].filter(value => value && value.length > 0);
}

// 記事リスト更新（ジャンルが配列のとき対応）
function updateArticleList() {
    const filteredList = currentFilter
        ? jsonResult.filter(item =>
            Array.isArray(item[selectedKey])
                ? item[selectedKey].includes(currentFilter)
                : item[selectedKey] === currentFilter
        )
        : jsonResult;

    console.log("filteredList", filteredList);
    htmlToElement(filteredList);
}

//スタジオまたは、ジャンルを選択するボタンを更新する関数
function updateSecondaryButtons() {
    if (selectedKey) {
        const selectList = listSet(jsonResult, selectedKey);
        selectChangeDetail(selectList);
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const filePath = "./search/reserachList.tsv"; // TSVファイルのパス
    jsonResult = await getJson(filePath);
    
    selectChangeEither(Object.keys(jsonResult[0]));
    // 初期表示として全件表示
    updateArticleList(); // 初期表示で全件表示しない
});