// swiper.js
const mySwiper = new Swiper('.swiper', {
    lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 2,
    },
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    speed: 5000,
    effect: "fade",
    autoplay: {
      delay: 3000,
    },
    allowTouchMove: false,
  });


  /**
   * TSV文字列をオブジェクト配列に変換する関数
   * (searchページで使用していたものを流用)
   */
  function toJson(filePath) {
    const rows = filePath.trim().split("\n");
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


// TSVをfetchし、上記 toJson()でパースする部分

    // 1. TSVファイルを取得して toJson() する
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

    // 2. Google DriveリンクからファイルIDを抜き出す
    function extractFileId(url) {
      const regex = /\/d\/([^/]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }

    // 3. 配列をシャッフルする
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    document.addEventListener("DOMContentLoaded", async () => {
      // 相対パスを環境に合わせて書き換えてください
      // (js/ フォルダから1つ上がって、search/ フォルダにある場合)
      const filePath = "../search/researchList.tsv";

      // TSV → JSON
      const jsonResult = await getJson(filePath);

      // もし TSV が空なら何もせず終了
      if (!jsonResult || jsonResult.length === 0) {
        console.warn("TSVにデータがありません。");
        return;
      }

      // 全作品をシャッフル
      shuffleArray(jsonResult);

      // HTMLにあらかじめ配置した .image-placeholder を取得
      const placeholders = document.querySelectorAll('.swiper .image-placeholder');

      // プレースホルダ数だけループを回して、ランダムに画像を差し込む
      // ※ 重複してもいいなら単に毎回 Math.random() で取り出す。
      //    重複させたくないなら splice() などで jsonResult から抜き取りながら使う。
      placeholders.forEach((placeholder) => {
        // ランダムに１件を選ぶ
        const randomIndex = Math.floor(Math.random() * jsonResult.length);
        const item = jsonResult[randomIndex];

        // Google DriveファイルID
        const fileId = extractFileId(item.image);

        // 既存のテキストを消す
        placeholder.innerHTML = '';

        // lazyロード用 <img data-src="..." class="swiper-lazy">
        const img = document.createElement("img");
        img.classList.add("swiper-lazy");
        img.setAttribute("data-src", `https://lh3.google.com/u/0/d/${fileId}`);
        img.alt = item.title || "No Title";

        // ローディング中表示するプリローダ
        const preloader = document.createElement("div");
        preloader.classList.add("swiper-lazy-preloader");

        placeholder.appendChild(img);
        placeholder.appendChild(preloader);
      });

      // Swiperに新たに挿入された画像を認識させる
      mySwiper.update();
      // Lazyロードをトリガー
      mySwiper.lazy.load();
    });
  