---
title: 'ElmでTodoアプリを作ってみる（２）'
archive: true
---

## Introduction

[前回の記事](https://akfm.dev/blog/2019-09-18/elm-todo.html)
ちょっと仕事詰め込みすぎてずっと働いてました、、、
というのは言い訳で、本当は Rust のチュートリアルこなしたり Scala の本読んだり、仕事以外で Input の時間は結構あったけど、やりかけを思い出すのってなんか面倒で放置したら半年以上たってしまいました。

前回、Json エンコードや Local Storage アクセスらへんについて説明したので、今回は前回説明しきれなかった

1. Model
2. Updata
3. Message
4. elm-css

らへんを説明していければと思います。

## Elm における状態管理とイベント

Elm には Elm アーキテクチャという思想があり、基本的に Elm アプリケーションは

- Model
- View
- Update

を定義して構築します。
Redux や Vuex は Elm アーキテクチャの影響を受けているので、Elm に手を出すような人はこれらを学んできた人も多いと思うので、理解しやすいかもしれません。

### Model

Model はサイト内における状態を管理しています。

```elm

-- MODEL


type alias Todo =
  { title : String
  , date : Time.Posix
  }


type alias Model =
  { zone : Time.Zone
  , time : Time.Posix
  , todos : List Todo
  , userInput : String
  }
```

今回の Todo では時計も持っているので、タイムゾーンと時間、Todo、入力中文字列を状態として扱うことになります。

### init

init は Elm アプリケーションを起動した際に実行され、Model の初期値や起動時に必要な調整処理を発行したりします。

```elm
init : D.Value -> (Model, Cmd Msg)
init flags =
  ( Model Time.utc (Time.millisToPosix 0) (todosDecode flags) "test"
  , Task.perform AdjustTimeZone Time.here
  )
```

flags は前回ちょっと書きましたが、JS 側で Elm 起動時に引数で渡せます。
なので、今回は Local Storage から取得した Todo 情報が init に渡されます。
これを元に、Model の初期値とタイムゾーン調整を促すタスクの発行を Cmd という Elm 外部とのやりとり用の仕組みを使ってやっています。

### Update

次に Update ですが、Update は Message と呼ばれる、Redux で言う所の action に応じて Model を更新する、いわば Reducer に当たる処理を記述します。

この辺は本当に Redux そっくりです。

```elm
-- UPDATE


type Msg
  = Tick Time.Posix
  | AdjustTimeZone Time.Zone
  | Add String
  | Delete Time.Posix
  | Input String


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Tick newTime ->
      ( { model | time = newTime }
      , Cmd.none
      )

    AdjustTimeZone newZone ->
      ( { model | zone = newZone }
      , Cmd.none
      )

    Add input ->
      let
        newModel =
          { model | todos = ( Todo input model.time ) :: model.todos, userInput = "" }
      in
      ( newModel
      , Ports.save (todosEncode newModel.todos)
      )

    Delete date ->
      let
        newModel = { model | todos = filter (isOldTodo date) model.todos }
      in
      ( newModel
      , Ports.save (todosEncode newModel.todos)
      )

    Input input ->
      ( { model | userInput = input }
      , Cmd.none
      )
```

Elm を初めてみた人でもわかるくらい、Redux そっくりじゃないですかね？
Add と Delete で Todo の List に新しい Todo を追加したり、時間から filter して特定の Todo を削除したりして、新しい Model を作成しています。
それをまた Cmd を使って外部へ保存命令を出しています。

### Message

Redux でいう action に当たるのが Message だと言いましたが、では Message はどうやって発行すればいいんでしょう？
これまた結構簡単で、dom の onclick 属性とかに発行してほしい Message の情報を渡すだけでおっけーです。

```elm
viewForm : String -> Styled.Html Msg
viewForm input =
  Styled.form
    [ onSubmit (Add input)
    , css
      [ marginTop (px 30)
      , color (hex "ccc")
      , fontSize (px 16)
      , lineHeight (px 16)
      ]
    ]
    [ Styled.p [] [ Styled.text "Write your new Todo." ]
    , Styled.input
      [ onInput Input
      , value input
      , css
        [ backgroundColor transparent
        , borderBottom3 (px 1) solid (hex "fff")
        , color (hex "fff")
        , fontSize (px 20)
        , lineHeight (px 20)
        , padding (px 10)
        , width (px 500)
        ]
      ]
      []
    ]
```

上記の`onInput Input`といいところがユーザーの入力値を Message にしているところですね。
onInput は Message を受け取って、ユーザーが input したらその Message を入力値とともに発行してくれます。
JS だとどんな関数でも実行できちゃうので人による好みとかパターンがいろいろ出てくるんですが、Elm のこのアプローチはシンプルだし、人による実装差異も生まれにくいわけです。

同じような感じで、Todo の更新と削除の Message も簡単に実装できます。

```elm
viewList : List Todo -> List (Styled.Html Msg)
viewList todos =
  case todos of
    [] ->
      []

    _ ->
      [ Styled.div
        [ css
          [ marginTop (px 30)
          ]
        ]
        [ Styled.ul
          [ css
            [ displayFlex
            , flexWrap wrap
            , marginTop (px -20)
            , marginLeft (px -20)
            ]
          ]
          <| ( todos
            |> List.map (\todo -> Styled.li
              [ css
                [ boxSizing borderBox
                , displayFlex
                , alignItems center
                , justifyContent spaceBetween
                , backgroundColor (hex "fff")
                , borderRadius (px 3)
                , boxShadow4 (px 0) (px 4) (px 24) (rgba 0 0 0 0.15)
                , color (hex "aaa")
                , fontSize (px 25)
                , padding3 (px 40) (px 20)  (px 20)
                , height (px 200)
                , width (px 200)
                , marginTop (px 20)
                , marginLeft (px 20)
                , position relative
                , transform (translateY (px 0))
                , transition
                  [ Css.Transitions.boxShadow 500
                  , Css.Transitions.transform 500
                  ]
                , hover
                  [ boxShadow4 (px 0) (px 4) (px 48) (rgba 0 0 0 0.3)
                  , transform (translateY (px -3))
                  ]
                ]
              ]
              [ Styled.text todo.title,
                Styled.button
                [ onClick (Delete todo.date)
                , css
                  [ position absolute
                  , top (px 20)
                  , right (px 20)
                  ]
                ]
                [ Styled.img
                  [ src "src/image/icon.png"
                  , css
                    [ width (px 20)
                    ]
                  ]
                  [
                  ]
                ]
              ]
            ))
        ]
      ]
```

ほとんどスタイルに関する設定で、onClick とかは 1 行ずつしかないですね。

## Elm におけるスタイルやシンタックス

### elm-css

実はこれ前回の記事にも書いたんですが、大事なことなのでもう一回言おうとお思います w
**elm-css を使うと CSS にも型を強制することができます。**

まぁブラウザで見てるんだから、実際に本番環境に壊れたスタイル属性が行くことってまぁほぼないとは思うんですが、とはいえ誤字で動かないとか指定の補完がないとか、Typescript とかでなれた方なら不満でいっぱいな部分じゃないかと思います（僕は不満です）。

ということで、これだけでも Elm 使う価値があるんじゃないかくらいやってみたら嬉しかった部分なので、Elm 触ってみる人はぜひこれがおすすめです。

### if 式やパターンマッチ

モダンな言語なら結構サポートしてると思いますが、if 式やパターンマッチはやっぱり素晴らしいですね。
パターンマッチは Ecma Script で proposal 出てるからそのうち JS もサポートするんだろうけど、好みとしては Elm や Rust のパターンマッチの書き方が今時っぽくて好きですね。

### その他のシンタックス

再代入不可、デフォルトでカリー化されてること、あと Haskell に似たこの独特なインデントの仕方が慣れてくるとすばらしいですね。
Rust や Scala も関数型言語の流れを汲んでいますが、こんくらい徹底されてるのはやはり一味違うなぁと思います。

## まとめ

ソースは以下で公開してます。
https://github.com/AkifumiSato/elm-todo/pull/1/files

ELm はやはり、チーム開発で利用するには一般認知度的にもまだまだ低いし、フロントエンド特化な言語なので今後も趣味以外でいじることはなさそうな気がしてます。
ただやはり最近の言語は関数型のシンタックスや流れを汲む傾向にあるので、Elm や Haskell を学ぶことはフロント・サーバーサイド問わずメリットは大きいと思います。

願わくば、僕の予想に反して Elm の案件とかがふえていくといいなぁ、、、
