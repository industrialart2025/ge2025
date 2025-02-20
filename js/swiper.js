// Swiper 初期化
const mySwiper = new Swiper('.swiper', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    speed: 1500, // フェードの速度（ミリ秒）
    effect: "fade",
    fadeEffect: {
      crossFade: true,  // クロスフェードを有効にする
    },
    autoplay: {
      delay: 3000,
    },
    allowTouchMove: false,
    // lazy オプションは使わず、自前で画像更新します
  });
    
  // 画像URL_IDを抜粋する関数
  function extractFileId(url) {
    const regex = /\/d\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
        
  // TSV文字列をオブジェクト配列に変換する関数
  function toJson(tsvString) {
    const rows = tsvString.trim().split("\n");
    const headers = rows[0].split("\t");
    return rows.slice(1).map(row => {
      const values = row.split("\t");
      return headers.reduce((obj, header, index) => {
        let value = values[index]?.trim();
        if (value) {
          // 先頭・末尾のダブルクォート、シングルクォートを除去
          value = value.replace(/^["']|["']$/g, '').trim();
        }
        // ジャンルの場合、カンマまたは「、」で分割
        if (header === 'genre' && value) {
          obj[header] = value.split(/[,、]/).map(g => g.trim());
        } else {
          obj[header] = value;
        }
        return obj;
      }, {});
    });
  }
        
  // TSVファイルを取得してJSONに変換する関数
  async function getJson(tsvPath) {
    try {
      const response = await fetch(tsvPath);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const tsvString = await response.text();
      const jsonData = toJson(tsvString);
      return jsonData;
    } catch (error) {
      console.error("TSV 取得エラー:", error);
      return [];
    }
  }
        
  // 配列をシャッフルする関数（ランダム性向上のため）
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
        
  document.addEventListener("DOMContentLoaded", async () => {
    // TSVファイルのパス（環境に合わせて修正）
    const filePath = "search/researchList.tsv";
        
    // TSV を JSON に変換
    const jsonResult = await getJson(filePath);
    if (!jsonResult || jsonResult.length === 0) {
      console.warn("TSVにデータがありません。");
      return;
    }
        
    // 全作品をシャッフル（初期ランダム順にするため）
    shuffleArray(jsonResult);
        
    // unusedImages は、一度表示した画像が再利用されないように管理するための配列
    let unusedImages = jsonResult.slice();
    shuffleArray(unusedImages);
        
    // unusedImages から次に使用する画像を取得する関数
    function getNextImageItem() {
      if (unusedImages.length === 0) {
        // 一巡したら再度全画像からシャッフルしたリストを用意
        unusedImages = jsonResult.slice();
        shuffleArray(unusedImages);
      }
      return unusedImages.pop();
    }
        
    // 各スライド内の .image-placeholder にランダム画像を読み込む関数
    function updateSlide(slideElement) {
      const item = getNextImageItem();
      const fileId = extractFileId(item.image);
      const placeholder = slideElement.querySelector('.image-placeholder');
      if (placeholder) {
        placeholder.innerHTML = ''; // 既存コンテンツをクリア
        const img = document.createElement('img');
        // 直接 src に画像URL を設定
        img.src = `https://lh3.googleusercontent.com/d/${fileId}`;
        img.alt = item.title || "No Title";
        // ※CSS側で、.swiper-slide img { width: 100%; height: 100%; object-fit: cover; object-position: center; } と設定してください
        placeholder.appendChild(img);
      }
    }
        
    // 初期表示時：全4枚のスライドにランダム画像をセット
    mySwiper.slides.forEach(slide => updateSlide(slide));
        
    // 変数に前回のアクティブスライドのインデックスを保持するための変数
    let leavingIndex;
        
    // スライド切替開始時に前回アクティブだったスライドのインデックスを記憶
    mySwiper.on('slideChangeTransitionStart', () => {
      leavingIndex = mySwiper.previousIndex;
    });
        
    // スライド切替完了時に、前回アクティブだったスライドのみ新たなランダム画像に更新
    mySwiper.on('slideChangeTransitionEnd', () => {
      if (typeof leavingIndex !== 'undefined') {
        updateSlide(mySwiper.slides[leavingIndex]);
        leavingIndex = undefined;
      }
    });
  });
  