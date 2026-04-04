2XKO GIRINプロジェクトのコンテキストを読み込みます。

まず「doc/PROJECT\_PROMPT.md」を読み込んでください。

引数: $ARGUMENTS

引数に応じて追加プロンプトも読み込むこと:

* 「web」→ PROMPT\_WEB.md を追加で読み込む
* 「bot」→ PROMPT\_DISCORD\_BOT.md を追加で読み込む
* 「combo」→ PROMPT\_COMBO\_DATA.md を追加で読み込む
* 「persona」→ PROMPT\_PERSONA.md を追加で読み込む
* 「money」→ PROMPT\_MONETIZE.md を追加で読み込む
* 「all」→ 上記すべてを読み込む
* 引数なし → PROJECT\_PROMPT.md のみ読み込む
* 複数指定可（例: 「web bot」→ 両方読み込む）

すべてのファイルは「girin/」配下にある。

読み込んだら「コンテキスト読み込み完了」と表示し、読み込んだプロンプトの一覧を表示してください。その後、ユーザーの指示を待ってください。

