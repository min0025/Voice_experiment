// 全ての刺激について
const all_stimuli = Array.from({ length: 100 }, (_, i) => {
  // 001形式にする
  const num = String(i + 1).padStart(3, "0");
  return {
    id: i,
    file: `../音声刺激（トリミング後）/VOICEACTRESS100_026_${num}.wav`,
  };
});

// 4グループに分割（25ずつ）
const groups = [
  all_stimuli.slice(0, 25),
  all_stimuli.slice(25, 50),
  all_stimuli.slice(50, 75),
  all_stimuli.slice(75, 100),
];

// =========================
// グループ割当
// =========================
const group_id = Math.floor(Math.random() * 4); // 0-3のランダムな整数
let assigned_stimuli = jsPsych.randomization.shuffle(groups[group_id]);

const practice_stimuli = [
  {
    id: "practice_1",
    file: "../練習試行用音声/VOICEACTRESS100_051.wav",
  },
  {
    id: "practice_2",
    file: "../練習試行用音声/VOICEACTRESS100_051 copy.wav",
  },
];

// SD法の評価項目
const adjectives = [
  { left: "男性的", right: "女性的" },
  { left: "幼い感じ", right: "老けた感じ" },
  // { left: "活発な", right: "弱々しい" },
  { left: "親切な", right: "意地悪な" },
  { left: "暖かい", right: "冷たい" },
  { left: "強そうな", right: "弱そうな" },
  { left: "偉そうな", right: "控えめな" },
];

// 人物像選択の選択肢
const likert_bio = [
  "成人男性",
  "少年",
  "おじいさん",
  "上司",
  "成人女性",
  "少女",
  "おばあさん",
  "お嬢様",
  "奥様",
  "幼児",
];

// SD法の評価指標
const likert_scale = [
  "<span style='font-size: 17px;'><p>とても<br>当てはまる</br></p></span>",
  "<span style='font-size: 17px;'><p>当てはまる</p></span>",
  "<span style='font-size: 17px;'><p>少し<br>当てはまる</br></p></span>",
  "<span style='font-size: 17px;'><p>どちらとも<br>いえない</br></p></span>",
  "<span style='font-size: 17px;'><p>少し<br>当てはまる</br></p></span>",
  "<span style='font-size: 17px;'><p>当てはまる</p></span>",
  "<span style='font-size: 17px;'><p>とても<br>当てはまる</br></p></span>",
];

function createVoiceTrials(stimuli, options = {}) {
  const {
    phaseLabel,
    blockName,
    questionText,
  } = options;

  return stimuli.map((stim, index) => {

    const shuffled_adjectives = jsPsych.randomization.shuffle([...adjectives]);

    return {
      type: jsPsychSurveyHtmlForm,
      required: true,
      button_label: "次へ",

      html: `
  <div class="stimulus-box">
    <p style="font-size: 30px;"><b>${phaseLabel}${index + 1} / ${stimuli.length} 音声目</b></p>
  </div>

  <p style="font-size: 19px; margin-top: 10px;">
      <b>${questionText}</b>
  </p>

  <p style="font-size: 19px; margin-bottom: 40px;">
      <b>※音声は一度しか流れません</b>
  </p>

  <div style="text-align: center; margin-bottom: 30px;">
    <button type="button" id="playBtn">再生</button>
    <audio id="audioElem" src="${stim.file}"></audio>
  </div>
  <hr>

  <div id="question-area" style="visibility: hidden; pointer-events: none;">
    <p style="font-size: 19px; margin-top: 50px;">
      <b>Q1. 流れた音声の印象について、下記の項目に最もよく当てはまるものを答えてください</b>
    </p>

    <div id="sd-container"></div>
    <hr>

    <p style="margin-top: 45px;">
      <b style="font-size: 19px;">Q1. 流れた音声から<U>最も</U>当てはまる「人物像」を<U>1つ選んでください</U></b>
    </p>
    <div class="bio-group">
      ${likert_bio.map(opt => `
        <label class="bio-option">
          <input type="radio" name="bio1" value="${opt}" disabled>
          <span>${opt}</span>
        </label>
      `).join("")}
    </div>

    <p style="margin-top: 100px;">
      <b style="font-size: 19px; margin-top: 100px;">Q2. 流れた音声から当てはまる「人物像」を<U><b>1問目の回答も含めて</b>全て選んでください</U><br>(
      1問目で回答した選択肢しか当てはまらない場合は、1問目と同じように回答してください）</b>
    </p>
    <div class="bio-group">
      ${likert_bio.map(opt => `
        <label class="bio-option">
          <input type="checkbox" name="bio2_${opt}" value="${opt}" disabled>
          <span>${opt}</span>
        </label>
      `).join("")}
    </div>
  </div>
`,

      data: {
        stim_id: stim.id,
        group: blockName === "practice_voice" ? "practice" : group_id,
        block: blockName,
      },

      // trial の required: true は消す
// required: true,

      on_load: () => {
        const form = document.querySelector("#jspsych-survey-html-form");
        const questionArea = document.getElementById("question-area");
        const audio = document.getElementById("audioElem");
        const playBtn = document.getElementById("playBtn");
        const submitBtn = document.querySelector("#jspsych-survey-html-form-next");

        let audioFinished = false;

        // -------------------------
        // SD法生成
        // -------------------------
        let html = "";

        shuffled_adjectives.forEach((pair, i) => {
          html += `<div class="sd-row">`;

          html += `
      <div class="sd-label left">
        <span style='font-size: 24px;'>${pair.left}</span>
      </div>
    `;

          html += `<div class="sd-scale">`;

          likert_scale.forEach((label, j) => {
            html += `
        <div class="sd-option">
          <input type="radio" name="sd_${i}" value="${j}">
          <div class="sd-text">${label}</div>
        </div>
      `;
          });

          html += `</div>`;

          html += `
      <div class="sd-label right">
        <span style='font-size: 24px;'>${pair.right}</span>
      </div>
    `;

          html += `</div>`;
        });

        document.getElementById("sd-container").innerHTML = html;

        // -------------------------
        // 判定関数
        // -------------------------
        const sdOk = () =>
          adjectives.every((_, i) =>
            !!form.querySelector(`input[name="sd_${i}"]:checked`)
          );

        const bio1Ok = () =>
          !!form.querySelector('input[name="bio1"]:checked');

        const bio2Ok = () =>
          form.querySelectorAll('input[name^="bio2_"]:checked').length > 0;

        const allOk = () =>
          audioFinished && sdOk() && bio1Ok() && bio2Ok();

        // -------------------------
        // UI更新
        // -------------------------
        const updateState = () => {
          // 音声終了後に SD と bio1 を解放
          form.querySelectorAll('input[name^="sd_"], input[name="bio1"]').forEach(el => {
            el.disabled = !audioFinished;
          });

          // bio2 は「音声終了 + bio1選択後」にだけ解放
          const enableBio2 = audioFinished && bio1Ok();
          form.querySelectorAll('input[name^="bio2_"]').forEach(el => {
            el.disabled = !enableBio2;
          });

          // 全部そろうまで Next は押せない
          submitBtn.disabled = !allOk();
        };

        // -------------------------
        // 初期状態
        // -------------------------
        submitBtn.disabled = true;
        form.querySelectorAll("input").forEach(el => el.disabled = true);

        // -------------------------
        // 再生ボタン
        // -------------------------
        playBtn.addEventListener("click", () => {
          playBtn.disabled = true;
          playBtn.textContent = "再生中...";

          audio.currentTime = 0;
          audio.play();
        });

        audio.addEventListener("ended", () => {
          playBtn.textContent = "再生済み";

          questionArea.style.visibility = "visible";
          questionArea.style.pointerEvents = "auto";

          audioFinished = true;
          updateState();
        });

        // -------------------------
        // 変更検知
        // -------------------------
        form.addEventListener("change", () => {
          updateState();
        });

        // -------------------------
        // submit 強制ブロック
        // -------------------------
        form.addEventListener("submit", (e) => {
          updateState();

          if (!allOk()) {
            e.preventDefault();
            alert("未回答があります。SD法6項目・単一選択1問・複数選択1問のすべてに回答してください。");
          }
        });

        // -------------------------
        // Nextボタン位置調整
        // -------------------------
        setTimeout(() => {
          if (form && submitBtn) {
            form.appendChild(submitBtn);

            submitBtn.style.display = "block";
            submitBtn.style.margin = "120px auto";
          }
        }, 0);
      },

      // =========================
      // データ回収
      // =========================
      on_finish: function (data) {
        const res = data.response || {};

        // SD法
        shuffled_adjectives.forEach((pair, i) => {
          const val = res[`sd_${i}`];
          data[`sd_${pair.left}_${pair.right}`] =
            val !== undefined && val !== "" ? Number(val) : null;
        });

        // 人物像（単一選択）
        data.bio1 = res.bio1 ?? null;

        // 人物像（複数選択）
        // survey-html-form では checkbox は同名項目が配列になることがある
        // 単数なら文字列のこともあるので両対応
        data.bio2 = Object.keys(res)
          .filter(key => key.startsWith("bio2_"))
          .map(key => res[key])
          .join("|");
      },
    };
  });
}

const practice_trials = createVoiceTrials(practice_stimuli, {
  phaseLabel: "練習 ",
  blockName: "practice_voice",
  questionText: "これは練習試行です。再生ボタンで音声を聞き、Q1 ~ Q3までの各問に回答してください",
});

const trials_combined = createVoiceTrials(assigned_stimuli, {
  phaseLabel: "",
  blockName: "voice_main",
  questionText: "再生ボタンで音声を聞き、Q1 ~ Q3までの各問に回答してください",
});

// 性別と年齢入力欄
const demographics = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<h1>お疲れ様でした</h1><p style='font-size: 20px'>ご自身の以下項目にご回答をお願いします</p>",
  html: `
      <p>
        性別:
        <label><input name="gender" type="radio" value="male" required> 男性</label>
        <label><input name="gender" type="radio" value="female"> 女性</label>
        <label><input name="gender" type="radio" value="other"> その他</label>
        <label><input name="gender" type="radio" value="noans"> 答えたくない</label>
      </p>
      <p>
        本日時点の年齢（例：23）: 
        <input name="age" id="age-input" type="number" min="0" max="120" required>
      </p></br>
    `,
  button_label: "次へ",
  on_load: () => {
    setTimeout(() => {
      const form = document.querySelector("#jspsych-survey-html-form"); // #jspsych-suevey-html-formのidを持つHTML要素を取得
      const button = document.querySelector("#jspsych-survey-html-form-next"); // #~のidを持つボタンを取得
      const genderInputs = form.querySelectorAll('input[name="gender"]'); //form内のname属性がgenderのinput要素を全て取得している
      const ageInput = form.querySelector("#age-input"); // form内のidがage-inputのinput要素を取得

      if (!button || !ageInput || genderInputs.length === 0) return;

      // 最初は押せない
      button.disabled = true;

      // 入力チェック関数
      const update = () => {
        const genderChecked = Array.from(genderInputs).some((r) => r.checked); // 性別ボタンにチェックが入ってるかのブール
        const ageValue = ageInput.value.trim(); // 入力値の取り出し
        const ageValid =
          ageValue !== "" &&
          !isNaN(ageValue) &&
          ageValue >= 0 &&
          ageValue <= 120; // 空値と0-120歳以外の範囲は無効
        button.disabled = !(genderChecked && ageValid);
      };

      // 変更時に監視
      genderInputs.forEach((r) => r.addEventListener("change", update)); // 選択入力変更時にアップデートを実施
      ageInput.addEventListener("input", update); // 年齢入力変更時にアップデート関数実施

      // 初期チェック（復帰時やオートフィル対策）
      update();
    }, 0);
  },
};

const post_experiment_survey = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<h1>最後にアンケートの回答をお願いします</h1><p style='font-size: 20px'>以下のすべての項目にご回答ください。</p>",
  html: `
      <div style="text-align: left; max-width: 980px; margin: 0 auto; font-size: 18px; line-height: 1.8;">
        <p><b>課題はスムーズに動きましたか？</b></p>
        <label><input name="task_smoothness" type="radio" value="smooth" required> スムーズに動いた</label><br>
        <label><input name="task_smoothness" type="radio" value="minor_issue"> やや問題があった</label><br>
        <label><input name="task_smoothness" type="radio" value="major_issue"> 重大な問題があった</label>

        <p style="margin-top: 28px;"><b>問題があったと回答された方は、どのような問題があったか、当てはまる項目を選んでください（問題なかった場合は「すべて問題なく動作した」を選択してください）</b></p>
        <label><input name="issue_type" type="radio" value="reload_needed" required> 文章や画像がロードされずリロードしなければならなかった</label><br>
        <label><input name="issue_type" type="radio" value="nothing_displayed"> 何も表示されないことがあった</label><br>
        <label><input name="issue_type" type="radio" value="connection_issue"> 実験中、インターネット接続が途切れたり、回線速度が遅くなったりした</label><br>
        <label><input name="issue_type" type="radio" value="no_issue"> すべて問題なく動作した</label>

        <p style="margin-top: 28px;"><b>実験の最中、何か課題とは関係のないこと（音楽を聴く、テレビを見るなど）をしましたか？（回答が謝礼に影響することはないので正直にお答えください）</b></p>
        <label><input name="unrelated_activity" type="radio" value="yes" required> はい</label><br>
        <label><input name="unrelated_activity" type="radio" value="no"> いいえ</label>

        <p style="margin-top: 28px;"><b>何らかの事情で実験を中断しましたか？（回答が謝礼に影響することはないので正直にお答えください）</b></p>
        <label><input name="interrupted" type="radio" value="yes" required> はい</label><br>
        <label><input name="interrupted" type="radio" value="no"> いいえ</label>

        <p style="margin-top: 28px;"><b>よろしければ、実験中の不具合や他気づいたことがあれば、そちらもこちらに記入してください</b></p>
        <textarea
          name="free_comment"
          rows="6"
          style="width: 100%; max-width: 100%; font-size: 16px; padding: 10px; box-sizing: border-box;"
        ></textarea>
      </div>
    `,
  button_label: "次へ",
  on_load: () => {
    setTimeout(() => {
      const form = document.querySelector("#jspsych-survey-html-form");
      const button = document.querySelector("#jspsych-survey-html-form-next");

      if (!form || !button) return;

      const requiredGroups = [
        "task_smoothness",
        "issue_type",
        "unrelated_activity",
        "interrupted",
      ];

      button.disabled = true;

      const update = () => {
        const allAnswered = requiredGroups.every((name) =>
          !!form.querySelector(`input[name="${name}"]:checked`)
        );
        button.disabled = !allAnswered;
      };

      form.addEventListener("change", update);
      update();
    }, 0);
  },
};

// ID確認用の画面
const check_id = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<h1>最後に</h1><br>" +
    "<p style='font-size: 20px'>表示された以下の5桁の番号を<B><U>メモして</U></B>、入力欄に同じように記入してください</p>" +
    "<p style='font-size: 20px'>（番号は謝礼取引に必要なので、<B><U>必ずメモして紛失しないように</B></U>注意してください）</p><br>" +
    `<p style='font-size: 26px'>${participant_ID}</p><br>`,
  html: `<p>
      番号： <input name="entered_id" id="entered-id" type="number" required>
    </p> 
    <p style="color:red; display:none;" id="id-error">
      番号が一致しません、もう一度お確かめください
    </p>
    `,
  button_label: "確認",
  on_load: () => {
    setTimeout(() => {
      const form = document.querySelector("#jspsych-survey-html-form");
      const button = document.querySelector("#jspsych-survey-html-form-next");
      const input = document.querySelector("#entered-id");
      const errorMsg = document.querySelector("#id-error");

      if (!form || !button || !input) return;

      // 最初は押せないボタン
      button.disabled = true;

      // 入力値が数字かどうかのチェック
      input.addEventListener("input", () => {
        button.disabled = input.value.trim() === "";
      });

      // ボタンを押したときに確認
      button.addEventListener("click", (e) => {
        const entered = input.value.trim();
        if (entered !== String(participant_ID)) {
          e.preventDefault(); // data_saveに進むのを止める
          errorMsg.style.display = "block";
        } else {
          errorMsg.style.display = "none";
        }
      });
    }, 0);
  },
};

// 本実験の流れをタイムラインに格納
function main_experiment() {
  return [
    experiment_notice,
    gap,
    fullscreen_notice,
    gap,
    practice_intermission,
    gap,
    ...practice_trials,
    gap,
    intermission,
    gap,
    ...trials_combined,
    gap,
    demographics,
    gap,
    post_experiment_survey,
    gap,
    exit_fullscreen,
  ];
}
