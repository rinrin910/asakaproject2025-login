document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.getElementById("openFilter");
    const closeBtn = document.getElementById("closeFilter");
    const modal = document.getElementById("filterModal");

    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

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

    // 全てクリアボタンの処理
    const clearBtn = document.querySelector(".clear-btn");

    clearBtn.addEventListener("click", () => {
        // select要素をすべて「選択」に戻す
        document.querySelectorAll(".filter-modal select").forEach(select => {
            select.selectedIndex = 0;

            // クラスも初期状態に戻す
            select.classList.add("default");
            select.classList.remove("filled");
        });

        // チェックボックスをすべてオフにする
        document.querySelectorAll(".filter-modal input[type='checkbox']").forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    document.querySelectorAll('.filter-modal select').forEach(select => {
        function updateSelectStyle() {
            if (select.value === "選択") {
                select.classList.add("default");
                select.classList.remove("filled");
            } else {
                select.classList.add("filled");
                select.classList.remove("default");
            }
        }

        // 初期状態のチェック
        updateSelectStyle();

        // 選択が変更されたら見た目を更新
        select.addEventListener("change", updateSelectStyle);
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

});
