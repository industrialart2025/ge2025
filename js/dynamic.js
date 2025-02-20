
document.addEventListener("DOMContentLoaded", async () => {
    // 1. TSV を JSON に変換
    const filePath = "../search/researchList.tsv";
    const jsonResult = await getJson(filePath);
  
    // 2. swiper-wrapperを取得
    const swiperWrapper = document.querySelector(".research-swiper .swiper-wrapper");
  
    // 3. 一旦クリアする
    swiperWrapper.innerHTML = "";
  
    // 4. JSONを元にスライド（画像）を追加
    jsonResult.forEach((item) => {
      // スライドのdivを作成
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
  
      // 画像要素を作成
      const img = document.createElement("img");
      const fileId = extractFileId(item.image);
      img.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
      img.alt = item.title;
  
    // 遅延読み込み (lazy) を Swiper とあわせたい場合は data-src を使う
    //   img.classList.add("swiper-lazy");
    //   img.setAttribute("data-src", `https://drive.google.com/uc?export=view&id=${fileId}`);
    //   const preloader = document.createElement("div");
    //   preloader.classList.add("swiper-lazy-preloader");
    //   slide.appendChild(preloader);
  
      // スライドに画像を挿入
      slide.appendChild(img);
      swiperWrapper.appendChild(slide);
    });
  
    // 5. 追加した分を Swiper に反映
    mySwiper.update();
  
    // Swiperのlazyオプションを使っているなら、さらに
    // mySwiper.lazy.load(); // 必要に応じて
    
  });