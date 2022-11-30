---
title: 'ElmでTodoアプリを作ってみる（１）'
archive: true
---

## Introduction

前の記事からずいぶん空いてしまいましたが、ずっと興味のあった Elm について Todo やってみました。

まだ制作途中ですが、なんとなく少し形になってきたので、途中ながら備忘録がてら躓きポイントをまとめたので、初めての方の参考になればと思います。

今回作るものの最終形は ↓ こんな感じです。

[https://akfm-elm-todo.netlify.com/](https://akfm-elm-todo.netlify.com/)

## Elm is ?

まず Elm について。
Elm は関数型言語です。

「Elm ってほぼ Haskell でしょ？」とか言われるんですが、Elm は Haskell より言語としてはかなりライトだと思います。
実際 0.19 までで初期にあったパラダイム（当初は FRP の本命とか言われたりしてたみたいですね）や機能も削られ、どんどんシンプルになっていってるらしいです。
あと Haskell はシンタックスも数学的アプローチの手法も多く、比較すると Elm は小難しい知識なしにいじれるようにはなってる気がします。

その分、Elm でやれることに不満を持った方には PureScript という変態言 g…すばらしい altJS があるので、こちらを試してみるといいと思います。

## 何はと思われまずは Tutorial

ここでは Todo アプリを作っていくにあたり初歩的な部分や細かい実装の解説はしないので、まだやっていない人は Tutorial をこなすことをお勧めします。

[https://guide.elm-lang.jp/](https://guide.elm-lang.jp/)

特に今回は

- JSON
- 時間取得
- JS とのやりとり
- 外部 CSS の読み込み

などが発生するので、Tutrorial の最後の方ですがちゃんとソース全部読みたい方は必見です。
この辺も全部わかってない状態で私はスタートしたので理解するのに苦労しました、、、

## Todo アプリの構成

Todo 情報の格納先は API とか用意したくなかったので localSorage にして、port で JS とつないでいます。
あと今回は後半もっかい書きますが、Css in JS 的な感じにやっぱしたかったので rtfeldman/elm-css を使用しています。

スタイル部分も完全に型の恩恵受けられるのは素晴らしいですね。
なんかもう、Html も Css も全部型欲しくなってくる。。。

ちなみにビルド処理は npm script にして、Elm のビルドは JS だけにして

```none
elm make src/Main.elm --output=build/elm.js
```

みたいな感じで JS だけビルドする形にしました。
ただ毎回ビルドするのは面倒なんで、開発中は elm-live 使ってました。

## 雛形の作成

正直ほとんど Tutorial の途中みたいなの拾えばやれるので、ここでは省略します。

ということで、完成形の全体像。

[https://github.com/AkifumiSato/elm-todo/tree/6638102abc354a77073bf4a8fb5ba9901567307c](https://github.com/AkifumiSato/elm-todo/tree/6638102abc354a77073bf4a8fb5ba9901567307c)

↑ を作るにあたり、躓いた部分をいくつか解説しようと思います。

## まず JS 側

```javascript
const app = Elm.Main.init({
  node: document.getElementById('elm'),
  flags: JSON.parse(localStorage.getItem('NxTodo')),
})
app.ports.save.subscribe(function (data) {
  localStorage.setItem('NxTodo', JSON.stringify(data))
})
```

今回は JSON とやり取りするので、port と flags を使って初期読み取りと update 時の API を定義しました。
JS 側で API を用意できるのでブラウザで用意する API の進化にも対応できるし、Elm は本当によくできた言語ですね（信者）。

## Elm 側の JSON デコード処理

Elm の全体部分はあとで Github のリンク貼るので躓いた箇所を中心に解説します。
まず flags 受け取ってデコードする部分。

```elm
-- ...
import Task
import Time
import Json.Decode as D
-- ...

init : D.Value -> (Model, Cmd Msg)
init flags =
  ( Model Time.utc (Time.millisToPosix 0) (todosDecode flags) "test"
  , Task.perform AdjustTimeZone Time.here
  )


todosDecode : D.Value -> List Todo
todosDecode flags =
  let
    decoder =
      D.list
        <| D.map2 Todo
          (D.field "title" D.string)
          (D.field "date"
            <| D.map (\val -> Time.millisToPosix val) D.int
          )
    result = (D.decodeValue decoder flags)
  in
  case result of
    Ok todos ->
      todos
    Err _ ->
      []
```

もうちょっと綺麗に書ける気もしてるのですがあしからず、、、

D.Value というデコード可能な値を受け取ってデコード処理をしてます。
Time や Task は Tutorial に解説は任せて、ここのデコード処理のネスト部分がネックでした。

デコードするにはまず**Decoder**というものが必要で、最終的には D.decodeValue decoder value と渡せればデコード処理がされます。
ただこの Decoder を作るには、プリミティブだったらいいんですが今回は Todo が Time.Posix を保持してるので変換処理を必要としています。

```elm
D.map (\val -> Time.millisToPosix val) D.int
```

ここがまさにその変換処理ですね。
D.map で D.int でデコードした値をさらに変換しています。

オブジェクト形式部分は D.map2、配列部分は D.list で対応しています。

## Elm の JSON エンコード処理

次は逆に保存時のエンコード処理です。

```elm
-- ...
import Json.Encode as E
-- ...
todosEncode : List Todo -> E.Value
todosEncode todos =
    E.list
      E.object
      ( todos
        |> List.map (\todo ->
          [ ( "title", E.string todo.title )
          , ( "date", E.int (Time.posixToMillis todo.date) )
          ] )
      )
```

なんかデコード処理と似てるには似てますね。
強いて言えばもうちょっとデコード側と合わせるように書けばよかったかな、、、

## Elm の Css in JS

一部ですが Elm で CSS in JS 的な感じで使えるライブラリとして先述した rtfeldman/elm-css を使用しているんですが、それを用いて Component 化（関数化）すると ↓ こんな感じになります。

```elm
viewHeader : String -> Styled.Html Msg
viewHeader time =
  Styled.header
    []
    [ Styled.h1
      [ css
        [ color (hex "fff")
        , fontSize (px 30)
        ]
      ]
      [ Styled.text "NxTodo" ]
    , Styled.p
      [ css
        [ color (hex "fff")
        , fontSize (px 100)
        , lineHeight (px 100)
        , marginTop (px 30)
        ]
      ]
      [ Styled.text (time) ]
    ]
```

スタイルをテキストで各部分はなくなり、許容できない型はエラーとなります。
アニメーションとかちょっと癖強かったけど、慣れてくるとこれは Css の理想形なのでは、、、って気になってきます。

## Main.elm の全体像

執筆時点での Elm の Main.elm は ↓ こんな感じです。

[https://github.com/AkifumiSato/elm-todo/blob/6638102abc354a77073bf4a8fb5ba9901567307c/src/Main.elm](https://github.com/AkifumiSato/elm-todo/blob/6638102abc354a77073bf4a8fb5ba9901567307c/src/Main.elm)

## まとめ

ざっくりポイント絞って説明してきましたが Elm はともかく楽しいし、JS ばっかいじってる私みたいな人間には非常に新鮮で JS で「こういうことできたらいいな」が結構増えたりもすると思います。

まだ追加しかできない Todo としては致命的状態なので、完成したらまた記事を書きたいと思います。

拙い説明でしたが、今回はここまで。
