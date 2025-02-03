
function extractFileId(url) {
    const regex = /\/d\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function getJson() {
    const filePath = "./search/testList.csv"; // CSVファイルのパス

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


function htmlToElement(json) {
    const testTitlesElement = document.querySelector(".test-titles");

    // リストに追加
    json.map(test => {
        const listItem = document.createElement("li");
        listItem.textContent = `タイトル:${test.title}`; // JSONデータのプロパティに合わせて修正
        testTitlesElement.appendChild(listItem);

        const studioItem = document.createElement("li");
        studioItem.textContent = `スタジオ:${test.studio}`; // JSONデータのプロパティに合わせて修正
        testTitlesElement.appendChild(studioItem);

        const imgItem = document.createElement("img")
        const fileId = extractFileId(test["notion_URL\r"]) // JSONデータのプロパティに合わせて修正
        imgItem.src = `https://lh3.googleusercontent.com/d/${fileId}`; // 画像のURLを設定
        testTitlesElement.appendChild(imgItem);
    });
}

let selectedKey = "";
let currentFilter = null;

function selectChange(selectKeys) {
    // フィルターボタンのためのコンテナを作成
    const filterContainer = document.querySelector('.search');
    document.body.appendChild(filterContainer);

    const filterItem = ["studio", "genre"]
    filterItem.map(key => {
        const select = document.createElement("button");
        select.textContent = key;
        select.addEventListener("click", () => {
            selectedKey = key;
            console.log("選択された値:", selectedKey);
            updateSecondaryButtons();
        });
        filterContainer.appendChild(select);
    })
}

function selectChange2(selectList) {
    const oldButtons = document.getElementById('secondary-buttons');
    if (oldButtons) {
        oldButtons.innerHTML = '';
    } else {
        const container = document.createElement('div');
        container.id = 'secondary-buttons';
        document.body.appendChild(container);
    }

    // すべて表示ボタンを追加
    const allButton = document.createElement("button");
    allButton.textContent = "すべて表示";
    allButton.addEventListener("click", () => {
        currentFilter = null;
        updateArticleList();
    });
    document.getElementById('secondary-buttons').appendChild(allButton);

    selectList.map(value => {
        const select = document.createElement("button");
        select.textContent = value;
        select.addEventListener("click", () => {
            console.log("選択された値", value);
            currentFilter = value;
            updateArticleList();
        });
        document.getElementById('secondary-buttons').appendChild(select);
    })
}

function listSet(json, key) {
    if (!key) return [];
    const list = [...new Set(json.map(item => item[key]))].filter(value => value && value.length > 0);
    console.log("list for key", key, list);
    return list;
}

function updateSecondaryButtons() {
    if (selectedKey) {
        const selectList = listSet(jsonResult, selectedKey);
        selectChange2(selectList);
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
    jsonResult = await getJson();
    selectChange(Object.keys(jsonResult[0]));
    // 初期表示として全件表示
    updateArticleList(); // 初期表示で全件表示しない
});