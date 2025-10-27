// ==== Firebase imports ====
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ==== あなたの設定 ====
const firebaseConfig = {
  apiKey: "AIzaSyDJhDQtSHKP1tPmGBYxcJaP0Q4Ic5B24o0",
  authDomain: "loginfittest.firebaseapp.com",
  projectId: "loginfittest",
  storageBucket: "loginfittest.firebasestorage.app",
  messagingSenderId: "349747039661",
  appId: "1:349747039661:web:366ce894f181f3aec76524"
};

// ==== 単一初期化 ====
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// 現在のログイン状態を保持
let isLoggedIn = false;

// ==== 便利関数 ====
const $ = (sel) => document.querySelector(sel);
const showMsg = (el, text) => { if (el) el.textContent = text; };

// ==== ページ判定（← path を先に定義！）====
const path = location.pathname.replace(/\/+$/, "");
const isIndex = /(?:^|\/)(index\.html)?$/.test(path);  // ルート/ もOK
const isHome  = /(?:^|\/)home\.html$/.test(path);

// ===== index.html 用（ログインページ）=====
const googleBtn = $('#googleBtn');
const googleMsg = $('#googleMsg');
const continueBtn = $('#continueBtn');          // 置いていなければ null のままでOK
const logoutBtnOnIndex = $('#logoutBtnOnIndex');// 同上

// if (googleBtn) {
//   const provider = new GoogleAuthProvider();
//   googleBtn.addEventListener('click', async () => {
//     try {
//       await signInWithPopup(auth, provider);
//       showMsg(googleMsg, 'Googleでログインしました。');      
//       const p = new URLSearchParams(location.search);
//       location.replace(p.get('next') || 'home.html');
//     } catch (err) {
//       showMsg(googleMsg, `Googleログイン失敗: ${err.code || err.message}`);
//     }
//   });
// }

if (googleBtn) {
    const provider = new GoogleAuthProvider();
    googleBtn.addEventListener('click', async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
  
        const email = user.email;
        const uid = user.uid;
  
        // 表示用
        console.log('ログイン成功:', { email, uid });
        showMsg(googleMsg, `Googleでログインしました。\nメール: ${email}\nUID: ${uid}`);
  
        // 保存して別ページで確認もできる
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userUid', uid);
  
        const p = new URLSearchParams(location.search);
        location.replace(p.get('next') || 'home.html');
      } catch (err) {
        console.error(err);
        showMsg(googleMsg, `Googleログイン失敗: ${err.code || err.message}`);
      }
    });
  }
  

if (continueBtn) {
  continueBtn.addEventListener('click', () => location.replace('home.html'));
}

if (logoutBtnOnIndex) {
  logoutBtnOnIndex.addEventListener('click', async () => {
    await signOut(auth);
    location.reload();
  });
}

// ===== home.html 用（任意でログアウトボタン対応）=====
const emailOut = $('#userEmail');
const uidOut   = $('#userUid');

const logoutBtn = $('#logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    //await signOut(auth);
    location.replace('index.html');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userUid');
    location.replace('index.html');
  });
}

// --- ここがポイント：自動遷移の条件を絞る
onAuthStateChanged(auth, (user) => {

    if (user) {
        console.log(`ログイン中: ${user.email}`);
        isLoggedIn = true;
        if(googleMsg){
            googleMsg.textContent = `${user.displayName || user.email} でログイン中`;
        }
      } else {
        console.log("未ログイン");
        googleMsg.textContent = "ログアウト中";
        isLoggedIn = false;
    }
   
    //変更10/24
    if (isHome) {
        if (user) {
          const email = user.email || localStorage.getItem('userEmail') || '';
          const uid   = user.uid   || localStorage.getItem('userUid')   || '';
          if (emailOut) emailOut.textContent = `メールアドレス: ${email}`;
          if (uidOut)   uidOut.textContent   = `UID: ${uid}`;
        } else {
          // 未ログインなら index に戻す（next 付きで）
          //location.replace('index.html?next=home.html');
          //今回は非ログイン者でもみれるようにするので上のコードはコメントアウト
        }
    }
    //変更10/24ここまで


});


// 以降に、既存のUIロジック（モーダル/カウント/タブ等）を続けてOK

// ここより下に、既存のUIロジック（モーダル/カウント/タブ等）を置く
// ※ 要素存在チェックを入れれば1ファイルで全ページ共存できます


document.addEventListener("DOMContentLoaded", function () {
    // フィルターモーダルの開閉処理
    const openFilter = document.getElementById("openFilter");
    const closeFilter = document.getElementById("closeFilter");
    const filterModal = document.getElementById("filterModal");

    openFilter.addEventListener("click", () => {
        filterModal.style.display = "flex";
        document.body.classList.add('modal-open');
    });

    closeFilter.addEventListener("click", () => {
        filterModal.style.display = "none";
        document.body.classList.remove('modal-open');
    });

    // ページ全体切り替え
    const homePage = document.getElementById("homePage");
    const settingPage = document.getElementById("settingPage");
    const openSetting = document.getElementById("openSetting");
    const backHome = document.getElementById("backHome");

    openSetting.addEventListener("click", () => {
        homePage.classList.remove("active");
        settingPage.classList.add("active");
    });

    backHome.addEventListener("click", () => {
        settingPage.classList.remove("active");
        homePage.classList.add("active");
    });

    // 設定ページ内の切り替え
    const subPages = document.querySelectorAll(".sub-page");
    const menuBtns = document.querySelectorAll(".menu-btn");
    const backBtns = document.querySelectorAll(".back-btn");

    function showSubpage(subpageId) {
        subPages.forEach(p => p.classList.remove("active"));
        document.getElementById(subpageId).classList.add("active");
    }

    menuBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            showSubpage(target);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            showSubpage("menuPage");
        });
    });


    // 教室モーダルをセットアップする共通関数
    function setupModal(modalId, openBtnId, closeBtnId) {
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const modal = document.getElementById(modalId);

        // このモーダル内のタブとパネルだけを取得
        const panels = modal.querySelectorAll('.tab-panel');
        const tabContainers = modal.querySelectorAll('.tabs > div');

        // モーダルを開く
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');

            // 初期化
            tabContainers.forEach(c => c.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // 先頭タブをアクティブ化
            const firstContainer = tabContainers[0];
            const firstButton = firstContainer.querySelector('button');
            const firstTarget = modal.querySelector(`#${firstButton.dataset.target}`);

            if (firstContainer && firstButton && firstTarget) {
                firstContainer.classList.add('active');
                firstTarget.classList.add('active');
            }
        });

        // 教室モーダルを閉じる
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });

        // タブ切り替え
        tabContainers.forEach(container => {
            const button = container.querySelector('button');
            button.addEventListener('click', () => {
                // このモーダル内だけをリセット
                tabContainers.forEach(c => c.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // クリックされたタブをアクティブ化
                container.classList.add('active');
                const target = modal.querySelector(`#${button.dataset.target}`);
                if (target) target.classList.add('active');
            });
        });
    }

    //空き情報カウント
    let classCount = 0;
    let freeCount = 0;

    const btnClass = document.getElementById("btnClass");
    const btnFree = document.getElementById("btnFree");
    const countClass = document.getElementById("countClass");
    const countFree = document.getElementById("countFree");

    // btnClass.addEventListener("click", () => {
    //     if (!isLoggedIn) {
    //       alert("ログインしていないと操作できません。");
    //       return;
    //     }
    //     classCount++;
    //     countClass.textContent = classCount;
    //   });
      
    // btnFree.addEventListener("click", () => {
    //     if (!isLoggedIn) {
    //       alert("ログインしていないと操作できません。");
    //       return;
    //     }
    //     freeCount++;
    //     countFree.textContent = freeCount;
    // });

    //変更10/24
    // 共通処理として関数を定義
    function handleCount(target) {
        if (!isLoggedIn) {
        alert("ログインしていないと操作できません。");
        return;
        }
    
        if (target === "class") {
        classCount++;
        countClass.textContent = classCount;
        } else if (target === "free") {
        freeCount++;
        countFree.textContent = freeCount;
        }
    }
    
    // クリックイベントで関数を呼び出す
    btnClass.addEventListener("click", () => handleCount("class"));
    btnFree.addEventListener("click", () => handleCount("free"));

    //変更10/24ここまで


    //空き情報カウント
    let garagaraCount = 0;
    let sukunameCount = 0;
    let hutsuCount = 0;
    let konzatsuCount = 0;

    const btnGaragara = document.getElementById("btnGaragara");
    const btnSukuname = document.getElementById("btnSukuname");
    const btnHutsu = document.getElementById("btnHutsu");
    const btnKonzatsu = document.getElementById("btnKonzatsu");
    const countGaragara = document.getElementById("countGaragara");
    const countSukuname = document.getElementById("countSukuname");
    const countHutsu = document.getElementById("countHutsu");
    const countKonzatsu = document.getElementById("countKonzatsu");

    //変更10/24
    function KonzatuCount(target) {
        if (!isLoggedIn) {
        alert("ログインしていないと操作できません。");
        return;
        }
    
        if (target === "garagara") {
            garagaraCount++;
            countGaragara.textContent = garagaraCount;
        } else if (target === "sukuname") {
            sukunameCount++;
            countSukuname.textContent = sukunameCount;
        }else if (target === "hutsu") {
            hutsuCount++;
            countHutsu.textContent = hutsuCount;
        }else if (target === "konzatsu") {
            konzatsuCount++;
            countKonzatsu.textContent = konzatsuCount;
        }
    }
    
    // クリックイベントで関数を呼び出す
    btnGaragara.addEventListener("click", () => KonzatuCount("garagara"));
    btnSukuname.addEventListener("click", () => KonzatuCount("sukuname"));
    btnHutsu.addEventListener("click", () => KonzatuCount("hutsu"));
    btnKonzatsu.addEventListener("click", () => KonzatuCount("konzatsu"));
    
    //変更10/24ここまで

    // モーダルごとに呼び出す
    setupModal('detail114', 'open114', 'close114');

    // コメント機能のセットアップ関数
    function setupComments(postBtnId, textareaId, listId) {
        const postBtn = document.getElementById(postBtnId);
        const textarea = document.getElementById(textareaId);
        const commentList = document.getElementById(listId);

        const detailBody = commentList.closest('.detail-body');

        postBtn.addEventListener('click', (e) => {
            e.preventDefault();

            //追加10/24
            if (!isLoggedIn) {
                alert("ログインしていないと操作できません。");
                return;
            }
            //追加ここまで10/24


            const text = textarea.value.trim();
            if (text === "") return;

            // コメント要素作成
            const item = document.createElement('div');
            item.className = 'comment-item';

            item.innerHTML = `
            <div class="comment-content">
                <div class="comment-text">${text}</div>
                <div class="comment-meta">
                    <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button class="like-btn">♡</button>
                    <span class="like-count">0</span>
                </div>
            </div>
        `;

            commentList.appendChild(item);
            textarea.value = "";

            setTimeout(() => {
                if (detailBody) {
                    detailBody.scrollTop = detailBody.scrollHeight;
                }
            }, 10);

            // いいねボタン処理
            const likeBtn = item.querySelector('.like-btn');
            const likeCount = item.querySelector('.like-count');
            let liked = false;

            likeBtn.addEventListener('click', () => {

                //追加10/24
                if (!isLoggedIn) {
                    alert("ログインしていないと操作できません。");
                    return;
                }
                //追加ここまで10/24
        
                liked = !liked;
                likeBtn.textContent = liked ? '❤' : '♡';
                likeBtn.classList.toggle('liked', liked);
                likeCount.textContent = liked
                    ? Number(likeCount.textContent) + 1
                    : Number(likeCount.textContent) - 1;
            });
        });
    }

    // コメント機能をモーダルごとにセットアップ
    setupComments('postBtn114', 'comments114', 'commentList114');


    // 空き教室一覧の処理
    const buildingButtons = document.querySelectorAll(".building-item");

    buildingButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;
            const detail = document.getElementById(targetId);
            const arrow = btn.querySelector(".arrow");

            const isVisible = detail.classList.contains("open");

            // 他の詳細を閉じる
            document.querySelectorAll(".building-detail").forEach(div => {
                div.classList.remove("open");
                div.style.maxHeight = null;
                div.style.opacity = 0;
            });

            document.querySelectorAll(".arrow").forEach(a => {
                a.textContent = "▼";
            });

            if (!isVisible) {
                detail.classList.add("open");
                detail.style.maxHeight = detail.scrollHeight + "px";
                detail.style.opacity = 1;
                arrow.textContent = "▲";

                // スクロールして詳細部分が見えるようにする（少し遅らせて）
                setTimeout(() => {
                    detail.scrollIntoView({
                        behavior: "smooth",
                        block: "center" // or "nearest", "center" も調整可
                    });
                }, 50); // 開き始めて少ししてからスクロール
            } else {
                detail.classList.remove("open");
                detail.style.maxHeight = null;
                detail.style.opacity = 0;
                arrow.textContent = "▼";
            }
        });
    });


    // 空き教室一覧を閉じる処理（多分）
    function openDetail(element) {
        // 最初に open クラスを追加してスタイル適用
        element.classList.add("open");

        // 一旦 max-height を auto にしてから、0 に戻す（リセット）
        element.style.maxHeight = "0px";

        // 少し待ってから scrollHeight を取得（スタイルが適用されるのを待つ）
        setTimeout(() => {
            const fullHeight = element.scrollHeight;
            element.style.maxHeight = fullHeight + "px";
        }, 50); // ← 50ms 待つと安定します（ブラウザによっては10msでもOKですが）
    }

    function closeDetail(element) {
        // 高さを0に → CSSアニメーションが走る
        element.style.maxHeight = "0px";

        // アニメーション終了後に open クラスを外す（必要なら）
        setTimeout(() => {
            element.classList.remove("open");
        }, 300); // ← CSSの transition の duration と合わせて！
    }





    // フィルタの項目をクリックした時の色変更
    document.querySelectorAll(".option-group button").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
        });
    });

    // 全てクリアボタンの処理
    const clearBtn = document.querySelector(".clear-btn");

    clearBtn.addEventListener("click", () => {
        // チェックボックスをすべてオフ
        document.querySelectorAll(".filter-modal input[type='checkbox']").forEach(checkbox => {
            checkbox.checked = false;
        });

        // 選択状態のボタンをリセット
        document.querySelectorAll(".option-group button").forEach(button => {
            button.classList.remove("active");
        });

        // キーワード入力欄もクリアしたいなら
        document.getElementById("keyword").value = "";
    });


    // ヘッダーに曜日と時限の表示
    const weekdays = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

    function isWithinRange(hour, minute, startHour, startMinute, endHour, endMinute) {
        const now = hour * 60 + minute;
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        return now >= start && now <= end;
    }

    function getPeriod() {
        const now = new Date();
        const dayLabel = weekdays[now.getDay()];
        const h = now.getHours();
        const m = now.getMinutes();

        let periodLabel = "時間外"; // デフォルト

        if (isWithinRange(h, m, 5, 0, 10, 30)) {
            periodLabel = "１限";
        } else if (isWithinRange(h, m, 10, 31, 12, 15)) {
            periodLabel = "２限";
        } else if (isWithinRange(h, m, 12, 16, 14, 35)) {
            periodLabel = "３限";
        } else if (isWithinRange(h, m, 14, 36, 16, 20)) {
            periodLabel = "４限";
        } else if (isWithinRange(h, m, 16, 21, 18, 5)) {
            periodLabel = "５限";
        } else if (isWithinRange(h, m, 18, 6, 19, 45)) {
            periodLabel = "６限";
        }

        return `${dayLabel}${periodLabel}`;
    }

    // ヘッダーのタイトル更新
    function updateTitle() {
        const headerTitle = document.querySelector('header h1');
        if (headerTitle) {
            headerTitle.textContent = getPeriod();
        }
    }

    updateTitle();

    setInterval(updateTitle, 60000);


    // ▼ ログイン処理 ▼
    const loginBtn = document.getElementById("login-btn");
    const loginScreen = document.getElementById("login-screen");
    const homeScreen = document.getElementById("home-screen");

    if (loginBtn) { // ← ログイン画面がある時だけ動くように安全チェック
        loginBtn.addEventListener("click", () => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (email && password) {
                loginScreen.style.display = "none";
                homeScreen.style.display = "block";
            } else {
                alert("メールアドレスとパスワードを入力してください");
            }
        });
    }

    

});
