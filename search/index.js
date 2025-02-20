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

// JSON から HTML要素を描画する関数
function htmlToElement(json) {
    const container = document.querySelector(".contents");
    const search = document.querySelector(".search");

    // 一度コンテナをクリアする
    container.innerHTML = '';

    // 検索結果の表示を更新
    search.innerHTML = '';
    const jsonLength = json.length;
    const searchResult = document.createElement("div");
    searchResult.textContent = `検索結果:${jsonLength}件`;
    search.appendChild(searchResult);

    // リストに追加
    json.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        // タイトルコンテナ
        const titleContainer = document.createElement("div");
        titleContainer.classList.add("title-container");
        const titleItem = document.createElement("div");
        titleItem.textContent = item.title;
        titleContainer.appendChild(titleItem);
        card.appendChild(titleContainer);

        // メインコンテナ（画像＋情報）
        const mainContainer = document.createElement("div");
        mainContainer.classList.add("main-container");

        // 画像コンテナ
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");
        const imgItem = document.createElement("img");
        const fileId = extractFileId(item.image);
        // imgItem.src = `https://lh3.google.com/u/0/d/${fileId}`;
        imgItem.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
        imgItem.alt = item.title;
        imageContainer.appendChild(imgItem);
        mainContainer.appendChild(imageContainer);

        // 情報コンテナ
        const infoContainer = document.createElement("div");
        infoContainer.classList.add("info-container");

        // 詳細リンクボタン
        const button = document.createElement("button");
        button.classList.add("button-custom");

        // テキストを追加
        const buttonText = document.createElement("span");
        buttonText.textContent = "詳しく見る";
        buttonText.classList.add("button-text"); // クラスを追加

        // 矢印アイコンを追加
        const arrowIcon = document.createElement("img");
        arrowIcon.src = "Arrow.svg"; // 矢印アイコンのパス
        arrowIcon.alt = "矢印";
        arrowIcon.classList.add("arrow-icon"); // スタイル用クラスを適用

        // ボタンに要素を追加
        button.appendChild(buttonText);
        button.appendChild(arrowIcon);

        // クリックでリンクを開く
        button.addEventListener("click", () => {
            window.open(item.notion_URL, "_blank");
        });

        infoContainer.appendChild(button);

        // スタジオ & ジャンルのコンテナ
        const studioGenreContainer = document.createElement("div");
        studioGenreContainer.classList.add("studio-genre-container");

        // スタジオ
        const studioItem = document.createElement("div");
        studioItem.textContent = item.studio;
        studioItem.classList.add("studio");
        studioGenreContainer.appendChild(studioItem);

        // ジャンル（配列内の各要素をdivとして追加）
        item.genre.forEach(genre => {
            const genreItem = document.createElement("div");
            genreItem.textContent = genre; // 各ジャンル名を表示
            genreItem.classList.add("genre");
            studioGenreContainer.appendChild(genreItem);
        });

        // スタジオ & ジャンルを infoContainer に追加
        infoContainer.appendChild(studioGenreContainer);

        // 展示番号
        const exNumItem = document.createElement("div");
        exNumItem.textContent = item.ex_number !== "#N/A" ? `# ${item.ex_number}` : "# Web Only";
        exNumItem.classList.add("exnum");
        infoContainer.appendChild(exNumItem);

        mainContainer.appendChild(infoContainer);
        card.appendChild(mainContainer);

        // カードをコンテナに追加
        container.appendChild(card);
    });
}



let selectedKey = "genre"; // 初期値をジャンルに設定
let currentFilter = null;

const keyMap = {
    "ジャンル": "genre",
    "スタジオ": "studio"
};

// スタジオまたは、ジャンルを選択するボタンを作成する関数
function selectChangeEither() {
    const filterContainer = document.querySelector('.button-container');
    filterContainer.innerHTML = ""; // 初期化（重複防止）

    const filterItem = ["ジャンル", "スタジオ"];

    filterItem.map(label => {
        const select = document.createElement("button");
        select.textContent = label;
        select.classList.add(label === "ジャンル" ? "genre-button" : "studio-button");

        select.addEventListener("click", () => {
            selectedKey = keyMap[label];
            updateSecondaryButtons();
        });

        filterContainer.appendChild(select);
    });

    updateSecondaryButtons();
}

function selectChangeDetail(selectList) {
    const container = document.querySelector('.button-container-secondary');
    container.innerHTML = ''; // 前のボタンをクリア

    let groupSize = selectedKey === "genre" ? 9 : 5; // ジャンルは9つずつ、スタジオは5つずつ
    let groupDiv = document.createElement("div");
    const groupPrefix = selectedKey === "genre" ? "genre" : "studio"; // "genre" または "studio" に基づく接頭辞
    groupDiv.classList.add("button-group", `${groupPrefix}-group-1`); // 最初のグループに接頭辞と番号を追加
    container.appendChild(groupDiv);

    let count = 0; // グループ内の要素数カウント
    let groupCount = 1; // グループ番号をカウント

    // すべて表示ボタンを追加（最初のグループに入れる）
    const allButton = document.createElement("button");
    allButton.textContent = "すべて表示";
    allButton.addEventListener("click", () => {
        currentFilter = null;
        updateArticleList();
    });
    groupDiv.appendChild(allButton);
    count++;

    selectList.forEach((value, index) => {
        // 指定した個数ごとに新しい div を作成
        if (count % groupSize === 0) {
            groupDiv = document.createElement("div");
            groupDiv.classList.add("button-group", `${groupPrefix}-group-${++groupCount}`); // ジャンルとスタジオで異なるグループ名
            container.appendChild(groupDiv);
            count = 0;
        }

        const button = document.createElement("button");
        button.textContent = value;
        button.addEventListener("click", () => {
            currentFilter = value;
            updateArticleList();
        });
        groupDiv.appendChild(button);
        count++;
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
    const filePath = "researchList.tsv"; // TSVファイルのパス
    jsonResult = await getJson(filePath);
    
    selectChangeEither(Object.keys(jsonResult[0]));
    // 初期表示として全件表示
    updateArticleList(); // 初期表示で全件表示しない
});