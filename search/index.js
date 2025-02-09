//画像URL_IDを抜粋する関数
function extractFileId(url) {
    const regex = /\/d\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

//csvをjsonに変換する関数
async function getJson(filePath) {
    try {
        // CSVをJSONに変換
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvString = await response.text();
        const jsonResult = csvToJson(csvString);
        console.log(jsonResult);

        return jsonResult
    } catch (error) {
        console.error("エラー:", error);
    }
}

//jsonからli要素を描画する関数
function htmlToElement(json) {
    const testTitlesElement = document.querySelector(".test-titles");

    testTitlesElement.innerHTML = ''; // 親要素内の子要素をすべて削除

    // リストに追加
    json.map(item => {
        const listItem = document.createElement("li");
        listItem.textContent = `タイトル:${item.title}`; // JSONデータのプロパティに合わせて修正
        testTitlesElement.appendChild(listItem);

        const studioItem = document.createElement("li");
        studioItem.textContent = `スタジオ:${item.studio}`; // JSONデータのプロパティに合わせて修正
        //testTitlesElement.appendChild(studioItem);

        const imgItem = document.createElement("img")
        const fileId = extractFileId(item["notion_URL\r"]) // JSONデータのプロパティに合わせて修正
        imgItem.src = `https://lh3.googleusercontent.com/d/${fileId}`; // 画像のURLを設定
        //testTitlesElement.appendChild(imgItem);
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
            console.log("選択された値:", selectedKey);

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
            console.log("選択された値", value);
            currentFilter = value;
            updateArticleList();
        });
        container.appendChild(button);
    });
}

//重複を削除する関数
function listSet(json, key) {
    if (!key) return [];
    const list = [...new Set(json.map(item => item[key]))].filter(value => value && value.length > 0);
    console.log("list for key", key, list);
    return list;
}

//スタジオまたは、ジャンルを選択するボタンを更新する関数
function updateSecondaryButtons() {
    if (selectedKey) {
        const selectList = listSet(jsonResult, selectedKey);
        selectChangeDetail(selectList);
    }
}

function updateArticleList() {
    const filteredList = currentFilter 
        ? jsonResult.filter(item => item[selectedKey] === currentFilter)
        : jsonResult;
    
    console.log("Filtered list:", filteredList);
    htmlToElement(filteredList);
}

document.addEventListener("DOMContentLoaded", async () => {
    const filePath = "./search/reserachList.csv"; // CSVファイルのパス
    jsonResult = await getJson(filePath);
    
    selectChangeEither(Object.keys(jsonResult[0]));
    // 初期表示として全件表示
    updateArticleList(); // 初期表示で全件表示しない
});