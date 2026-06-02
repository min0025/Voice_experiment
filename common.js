// 共通設定
const expname = "characteristic_voice"; // 実験名（ファイル名に使う）
const datapipe_experiment_id = "S9gIeGgus6Lo"; // DataPipeの実験ID（OSF保存用）

// 被験者ID（5桁ランダム）
var participant_ID = Math.floor(Math.random() * 90000) + 10000;

// jsPsych初期化（ここで1回だけ）
var jsPsych = initJsPsych();

// ファイル名生成
// クラウド(DataPipe)保存用のファイル名を生成
function createfilename(argseed) {
    // 日付時間秒を文字列で返す
    const dt = new Date();
    var yyyy = dt.getFullYear();
    var mm = ('00' + (dt.getMonth()+1)).slice(-2);
    var dd = ('00' + dt.getDate()).slice(-2);
    var hh = ('00' + dt.getHours()).slice(-2);
    var mi = ('00' + dt.getMinutes()).slice(-2);
    var se = ('00' + dt.getSeconds()).slice(-2);
    var answer = yyyy + mm + dd + "-" + hh + mi + se ;
    const subject_id = jsPsych.randomization.randomID(10);
    answer = argseed + answer + "-" + subject_id + ".csv" ;
    return(answer);
};
filename = createfilename(expname);

// イントロから問題までのインターバル
const gap = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    trial_duration: 300 // ← 500ミリ秒
};

// 実験の同意書部分
const consent_form = {
  type: jsPsychSurveyMultiSelect,
  questions: [
    {
      prompt: "実験のご協力に同意いただける方は下記のチェックボックスにチェックを入れ、「次に進む」ボタンをクリックしてください。<br>同意いただけない方はそのままタブを閉じてください。",
      options: ['<b>本実験に参加することに同意する</b>'],
      required: true
    }
  ],
  preamble: '<header class="header">実験に関する同意説明書</header>' +
      '<div class="consent">' +
      '<p class="title">1. 実験概要</p>' +
      '<p class="contents">音声を聞いた際に、その音声に対してどんな印象を感じるかおよびにどんな人物像を想起するかを、様々な評価を通して調査することを目的としています。</p>' +
      '<p class="title">2. 実験方法</p>' +
      '<p class="contents">本実験はwebブラウザ上で行います。複数の音声（3~4秒程度）を聞いていただき、各音声に対して複数の質問に回答してもらいます。実験の所要時間は30分程度です。</p>' + 
      '<p class="title">3. 実験結果データの扱いについて</p>' +
      '<p class="contents">本実験で得られたデータは統計的に処理され、学術研究の目的に限って使用されます。データを個人が特定可能な形で外部に公開することは一切ありません。</p>' +
      '<p class="title">4. 謝礼について</p>' +
      '<p class="contents">本実験に参加いただいた方には、600円の謝礼をお渡しします。（クラウドワークスの決済機能を通じて支払われます）</p>' +
      '<p class="title">5. 実験協力の自由および同意の撤回について</p>' +
      '<p class="contents">本実験への参加は、参加者ご自身の意思に基づくものであり、強制ではありません。実験前や実験中を問わず、ブラウザのタブを閉じることでいつでも参加を取りやめることができます。本実験に参加しないことによる不利益や同意の撤回に伴う不利益はありません。</p>' +
      '<p class="title">6. 実験に関する注意事項</p>' +
      '<p class="contents">実験は、<B><U>必ず「ヘッドホン」か「イヤホン」をつけてもらい</U></B>、静かな環境でのご参加をお願いいたします。実験中は、携帯電話を用いた音声通話やメール（他者との連絡）、SNSへの投稿なども行わないでください。また、ブラウザの「戻る」ボタンはクリックしないようお願いいたします。そして、本実験の内容について、第三者への情報漏洩をしないようお願いいたします。</p>' +
      '<table class="affiliation"><tr><th>実験担当者 </th><th>明治大学大学院先端数理学研究科先端メディアサイエンス専攻 劉承旻</th></tr>' +
      '<tr><th>実験責任者 </th><th>明治大学総合数理学部先端メディアサイエンス学科 森勢将雅</th></tr>' +
      '<tr><th>住所 </th><th>〒164-8525 東京都中野区中野４丁目２１-１（森勢研究室）</th></tr>' +
      '</div>', 

  button_label: ['次へ']
};

const worker_id_form = {
  type: jsPsychSurveyHtmlForm,
  preamble: "<h1>作業者IDの入力</h1>",
  html: `
    <p style="font-size: 20px">作業者ID（作業者ページURLの数字）を半角英数で入力してください。</p>
    <p style="margin-top: 20px;">
      <input
        name="worker_id"
        id="worker-id"
        type="text"
        inputmode="latin"
        autocomplete="off"
        pattern="[A-Za-z0-9]+"
        required
        style="font-size: 18px; width: 320px; padding: 8px;"
      >
    </p>
  `,
  button_label: "次へ",
  on_load: () => {
    setTimeout(() => {
      const form = document.querySelector("#jspsych-survey-html-form");
      const button = document.querySelector("#jspsych-survey-html-form-next");
      const input = document.querySelector("#worker-id");

      if (!form || !button || !input) return;

      button.disabled = true;

      const isValid = () => /^[A-Za-z0-9]+$/.test(input.value.trim());

      input.addEventListener("input", () => {
        button.disabled = !isValid();
      });

      form.addEventListener("submit", (e) => {
        if (!isValid()) {
          e.preventDefault();
          button.disabled = true;
          input.focus();
        }
      });
    }, 0);
  },
  on_finish: function(data){
    const worker_id = data.response?.worker_id?.trim() ?? "";
    data.worker_id = worker_id;
    jsPsych.data.addProperties({
      worker_id: worker_id
    });
  }
};

// 保存
// DataPipe保存設定
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: datapipe_experiment_id, 
  filename: filename,
  data_string: ()=>jsPsych.data.get().csv()
};

// 実験終了の画面
const thanks = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 
      '<div style="max-width: 900px; margin: 40px auto 0; text-align: center;">' +
      '<p style="font-size: 28px; margin: 0 0 6px 0;">この度は、調査へのご協力ありがとうございました。</p>' +
      '<p style="font-size: 28px; margin: 0 0 6px 0;">参加確認の際に、下記の確認コードが必要になります。</p>' +
      '<p style="font-size: 28px; margin: 0 0 44px 0;">必ず控えを取っておいてください。</p>' +
      `<p style="font-size: 56px; font-weight: bold; margin: 0 0 56px 0;">${participant_ID}</p>` +
      '<p style="font-size: 22px; margin: 0;">ウィンドウを閉じて実験を終了してください。</p>' +
      '</div>',
    choices: "NO_KEYS"
};
