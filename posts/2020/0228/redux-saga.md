---
title: 'まだredux-saga使ってないの？'
archive: true
---

## Introduction

煽りタイトルすいません。。。
React Retux を使うとだれしもが一度は副作用(非同期通信)で悩むと思います。
React の useEffect 内で fetch したり、useState や Redux の middleware ライブラリで対応したり、やり方はいろいろあるかと思います。
今回は最近ずっと僕がはまってる、redux-saga について書いていきたいと思います。

## Redux における副作用

Redux で副作用を扱おうと思ったら大抵出てくるのは

- redux-thunk
- redux-saga

ら辺かと思います。
他には先述の通り、そもそも Redux の middleware で解決せずに React 側で副作用を解決しちゃう方法とかもありますが、React のライフサイクルを完全に意識する必要があるので、あまりぼくはおすすめしません。

上記 2 つはどちらも副作用を扱うのは変わらないのですが、結構やり方は両極端な感じです。

### redux-thunk

そもそも thunk とは、関数型のテクニックのひとつで、引数なしの関数などを返し手続き的な関数を得ることで好きなタイミングでその関数を実行できるものです。

```ts
const consoleThunk = (text: string) => () => {
  console.log(text)
}
```

では redux における thunk とはなんでしょう？
そう、action です。redux-thank は副作用を action で管理します。
action の payload は基本的に値が入ってますが、redux-saga は payload を関数にしちゃおう、という話です。

```ts
// action
const incrementAsync = () => (dispatch) => {
  setTimeout(() => {
    dispatch(increment())
  }, 1000)
}
```

上記のように、action 自体を関数にして非同期処理をその中で行えば action 発行後、どういう依存関係のある action が発行されるかみやすいよね！っていうのが thunk のアプローチですね。
thunk のアプローチはシンプルなので、万人受けしやすいんですが、action 自体が副作用を持ってしまうために非同期処理が複数になったり複雑化するとカオス化しやすいので、注意が必要です。

まぁそもそもフロント側でネットワークを挟んで複雑なことをすること自体がアンチパターン感はありますが、現実はそううまくはいかないものですすよね…。
ということでそういった複雑化にも耐えうるライブラリとしておすすめなのが、redux-saga です。

### redux-saga

redux-saga は副作用を並列で走らせたり、直列で走らせたりするのを独自の task という概念で表現しています。
task は action を待ったり(take)、副作用を実行したり(call)、他の action を発行したり(put)、はたまた task 同士の排他制御をしたり(takeLatest,join)できます。
この独自のアプローチは敷居が高くなり敬遠される原因になりがちではあるんですが、このアプローチは Redux の世界にプロセス制御のような世界観を与え、結果的に副作用同士の関係性を宣言的に表すことを可能にします。

今回はこの saga の使い方を深掘って行こうと思います。

## redux-saga の導入

### task の作成

redux-saga は先述の通り、task という概念に副作用を閉じ込めるので、task の作成からやってみましょう。
task は実態としては実はただのジェネレーターです。
ただし、ジェネレーターの中で行う副作用をうまくあつかうために saga が存在します。
ここでは例として、ユーザーがログインしてなかったら fetch を行う task をみてみましょう。

```ts
// type
type State = {
  user: {
    isLogin: boolean
    userId: string
    password: string
  }
}

// selector
const userSelector = (state: State) => state.user

// task
import { select, call, put } from '@redux-saga/core/effects'

function* tryLogin() {
  const user: ReturnType<typeof userSelector> = yield select(userSelector)
  if (user.isLogin) {
    yield put(alreadyLoginAction())
  } else {
    try {
      const payload = yield call(fetchUser, user.userId, user.password)
      yield put(loginAction(payload))
    } catch (e) {
      alert('ログイン情報の取得に失敗しました。')
    }
  }
}
```

selector は馴染みがあまりない方のために説明すると、state から関心のあるところだけを引き抜く関数をよく selector と呼んでいます。
そして task となるジェネレーターの中では１行目から、saga の core effect の select を使用していますね。
これらの effect を利用している箇所を見るとわかるのですが、全てに対し`yield`がかかってます。
この辺が saga のちょっと面白いところで、副作用などの呼び出しである effect を全て`yield`することで同期的にプログラムを書いてるような錯覚を覚えさせます。
（まぁこれは saga の特性というか、ジェネレーターではあるんですが、、、）

それでは上記で使用した effect についてみていきましょう。

select は現在の state から情報を引き抜くための関数で、selector を渡すと state から情報を引き出してくれます。現在の State を元に fetch したりするのに便利です。
次に出てくる effect は put ですね。
put は引数に渡した action を dispatch してくれます。
redux-thunk だと dispatch を受け取ってやってたところの代替ですね。
そして最後にでてくるのが call、Promise を返す関数の呼び出しです。
ここが面白いところで、「普通に関数呼び出せばいいじゃん」と思った方も多いのではないでしょうか。
実はここ、普通に yield して関数を呼び出せば全然動作としては問題なく動作します。
ただわざわざ call という関数を通して呼び出しているのは、テストのしやすさを考慮してのことです。

というのも、Jest とかで非同期処理を含むテストを書いたことのある方ならわかると思いますが、非同期処理を呼び出す方の関数っていちいち Mock しないといけないんですよね。
これが増えてくると Mock 地獄になって地味に面倒になってきます。
この辺は後述で詳細書こうかと思います。

### task の起動と middleware の登録

task を作成したら、今度はタスクの開始を行わなければいけません。
task はただのジェネレーターなので、呼び出さなければただ定義しただけになってしまいます。
ではこの task はどうやって開始すれば良いでしょう？

task の開始は`fork`という effect によって開始できます。
今回の例だと、ログインを試みる部分の副作用をまとめたので`tryLogin`という action が発行されたら毎回上記 task を開始する、としたいところですね。
これを fork とある action を待機する`take`で記述してみると以下のような感じになります。

```ts
import { select, call, put } from '@redux-saga/core/effects'

function* tryLogin() {
  while (true) {
    yield take(TRY_LOGIN) // action type
    const user: ReturnType<typeof userSelector> = yield select(userSelector)
    if (user.isLogin) {
      yield put(alreadyLoginAction())
    } else {
      try {
        const payload = yield call(fetchUser, user.userId, user.password)
        yield put(loginAction(payload))
      } catch (e) {
        alert('ログイン情報の取得に失敗しました。')
      }
    }
  }
}

export function* rootSaga() {
  yield fork(tryLogin)
}
```

この rootSaga もまた task で、最終的には store の作成時に

```ts
const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  combineReducers({
    user,
  }),
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(rootSaga)
```

というように、rootSaga を run に渡すことで最初のタスクが起動します。

ただこれだと結構なケースが無限に起動できるように while で括らなくてはならなくなりますよね。
saga ではこのような毎回同じ起動をするような場合の effect として、`takeEvery`があります。
下記のコードは先述の rootSaga と全く同じ動きをします。

```ts
function* tryLogin() {
  const user: ReturnType<typeof userSelector> = yield select(userSelector)
  if (user.isLogin) {
    yield put(alreadyLoginAction())
  } else {
    try {
      const payload = yield call(fetchUser, user.userId, user.password)
      yield put(loginAction(payload))
    } catch (e) {
      alert('ログイン情報の取得に失敗しました。')
    }
  }
}

export function* rootSaga() {
  yield takeEvery(TRY_LOGIN, tryLogin)
}
```

他にも似たような effect で`takeLatest`や`takeLeading`などもあり、先勝ちで処理をしたい際など自前で排他制御を実装せずに実現することもできます。
この辺は thunk だとやりずらそうなところですね。

## redux-saga のテスト

さて、実際に saga を実装してみたんですが、割と独自の世界観で成り立っているのは伝わりましたかね？
「癖強いなー」という印象を持ったようであれば、ぼくも同感です w
ただ saga のすごいところは、この癖の強めなコードのテストがめちゃくちゃ書きやすいことです。
ぼくが saga のいちばんん好きなところと言っても過言ではないです。

saga のテストには`redux-saga-test-plan`というのを使用するととても楽です。

```ts
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga-test-plan/matchers'
import { rootSaga } from './sagas'
import { userSelector } from './selectors'

test(`[rootSaga]`, () => {
  const payload = { sessionId: 'sessionId' }

  return expectSaga(rootSaga)
    .provide([
      [
        select(userSelector),
        {
          isLogin: false,
          userId: 'userId',
          password: 'password',
        },
      ],
      [call(fetchUser, 'userId', 'password'), payload],
    ])
    .dispatch(tryLogin())
    .take(TRY_LOGIN)
    .call(fetchUser, 'userId', 'password')
    .put(loginAction(payload))
    .silentRun()
})
```

ざっくりですが説明すると、expectSaga に渡すと全ての effect を擬似的に Mock できるというか、呼ばれた順にどんな値で呼ばれたかなどをテストしていけます。
ここで Mock したい関数などが出てきたら、最初に provide メソッドで返却する値を指定することができます。
これにより、state がどんな状態なのか、関数がどんな値を返すのかなどを jest の Mock などを 1 個も使わずに書くことができます。

上記の例だと tryLogin してから実際に login するまでのシナリオが描かれていますね。
このテストのしやすさも、saga の強みの一つです。

## まとめ

saga には race や debounce、join などユニークな関数がまだまだたくさんあり、まるで JS 以外のスケジューリング可能な言語を書いているような感覚にさせてくれる面白いライブラリです。
確かに導入ハードルは thunk などより高いかもしれませんが、thunk より記述量や抽象実装はしやすいので、thunk で疲れた人にはぜひおすすめです！
