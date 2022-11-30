---
title: 'まだredux-toolkit使ってないの？'
archive: true
---

## Introduction

以前あげた[redux-saga の記事](/blog/2020-02-28/redux-saga.html)で redux-saga の素晴らしさを書いてみたんですが、saga は導入ハードルこそ高いですが、複雑な副作用制御に秩序をもたらせる素晴らしいライブラリーです。
ただ逆に言うと、そこまで複雑な副作用制御を必要としない場合、saga は too much になるとも思います。

そもそも軽く使うには、Redux って結構色々知らなきゃいけなかったりしますよね。

- デバッグ：redux-devtools-extension
- 設計：ducks, reducks, redux-way
- 非同期処理：redux-thunk, redux-saga
- immutable 系：immer, immutablejs
- utility：redux-actions, typescript-fsa
- その他：normalizr, reselect

とまぁ、これらの中で今回のプロジェクトでどれをどう使うか選択しなきゃだし、地味にコストはかかるものです。
だからこそプロジェクト用に自前の Redux 入りボイラープレートとか用意する人も多かったのではないでしょうか？

こういった現状を解決しようと Redux の中の人が作ったある種のテンプレートが[redux-toolkit](https://redux-toolkit.js.org/)です。

## redux-toolkit

### redux-toolkit とは？

Redux メンテナの 1 人、[Mark Erikson](https://github.com/markerikson)先生がはじめたプロジェクトで、Redux のリポジトリにある公式なライブラリです。
前述のように、Redux 自体は軽量で限られた部分を担うライブラリのため、関連ライブラリなども豊富なで多くの選択肢やプラクティスが存在します。
なのでそれらを公式がまとめ、最適化したものがこの redux-toolkit です。

create-react-app の redux の template があるのですが、その中でもこの redux-toolkit が使われており、また公式サポートなベストプラクティスなので
今後デファクトスタンダードになっていくのではないかと思います。

### 主な特徴

redux-toolkit は以下のライブラリを内包しています。

- immer
- redux-thunk
- reselect

また直接内包しているわけではないですが、

- redux-devtools-extension がデフォルトで設定されており、boolean で切り替え可能
- autodux に由来する**slice**作成が可能（ducks や re-ducks が短くかける）

といった機能もあり、多くの人がプロジェクトごとに毎回書いてた冗長な記述が不要になっています。

### 主要な API

主要な API を簡単に書いておくと、↓ こんな感じです。

- **configureStore**：Redux の createStore 周りの設定をいい感じにまとめたもの
- **createAction**：redux-actions 同様、action 生成の Utility
- **createReducer**：reducer の冗長になりがちな記述を短くかける Utility
- **createSlice**：autodux に由来する slice を生成する、**reducer 名称を元に action が自動発行される**
- **createAsyncThunk**：thunk を作成し、「pending」「fulfilled」「rejected」という postfix 付きの action を発行する

※細かい内容は[公式の Tutorial](https://redux-toolkit.js.org/tutorials/basic-tutorial)を参照ください。

## redux-toolkit を実際に使ってみる

ちょっと前置きが長くなりましたが、実際に本サイト（今日時点で[Contact](/contact/)周りのみ Redux を使用）へ適用してみたときのソースをみていきたいと思います。
redux-toolkit を入れる前から ducks 構成だったので、redux-toolkit の slice を使用して ducks 構成のまま適用しました。

### Slice

slice 周りのソースは ↓ こんな感じになりました。

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  commentValidate,
  mailValidate,
  nameValidate,
} from '../../utils/contactValidater'

export type UserState = {
  name: {
    value: string
    error: string
  }
  email: {
    value: string
    error: string
  }
  comment: {
    value: string
    error: string
  }
  isCompletedSubmit: boolean
}

type Reducer = {
  updateName: (state: UserState, { payload }: PayloadAction<string>) => void
  updateEmail: (state: UserState, { payload }: PayloadAction<string>) => void
  updateComment: (state: UserState, { payload }: PayloadAction<string>) => void
}

const userSlice = createSlice<UserState, Reducer>({
  name: 'user',
  initialState: {
    name: {
      value: '',
      error: '',
    },
    email: {
      value: '',
      error: '',
    },
    comment: {
      value: '',
      error: '',
    },
    isCompletedSubmit: false,
  },
  reducers: {
    updateName: (state, { payload }) => {
      const error = nameValidate(payload)
      state.name.value = payload
      state.name.error = error
    },
    updateEmail: (state, { payload }) => {
      const error = mailValidate(payload)
      state.email.value = payload
      state.email.error = error
    },
    updateComment: (state, { payload }) => {
      const error = commentValidate(payload)
      state.comment.value = payload
      state.comment.error = error
    },
  },
})

export const { updateName, updateEmail, updateComment } = userSlice.actions

export default userSlice.reducer
```

reducers のキー名がそのまま action として作成されるので、複雑な action を生成できないという制限もつれけるし行数も減って良いですね。
reducer に渡す callback が immer が適用されてて、mutable っぽくかけるのがちょっと微妙だなと思ってたんですが、実際使ってみるとやっぱ短くはなるし悪くないですね。
何よりこれくらいの依存なら Redux の三原則さえ理解してれば「action とか reducer をいい感じにやってくれてるんだ」くらいは初見でもわかるのがいいですね。

（まぁこのサイトは僕以外がいじることはないと思いますが・・・）

### Thunk

非同期処理も redux-toolkit の createAsyncThunk を使うように修正しました。

```ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { navigate } from 'gatsby-link'
import { State } from '../../store'
import {
  commentValidate,
  mailValidate,
  nameValidate,
} from '../../utils/contactValidater'
import { encode } from '../../utils/encode'

type ThunkConfig = {
  state: State
  rejectValue: {
    nameError: string
    emailError: string
    commentError: string
  }
}

export const postContactForm = createAsyncThunk<void, string, ThunkConfig>(
  'user/postContactForm',
  async (formName, { getState, rejectWithValue }) => {
    const {
      app: {
        user: { name, email, comment },
      },
    } = getState()

    const nameError = nameValidate(name.value)
    const emailError = mailValidate(email.value)
    const commentError = commentValidate(comment.value)

    if (nameError || emailError || commentError) {
      return rejectWithValue({
        nameError,
        emailError,
        commentError,
      })
    }

    const req = fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': formName,
        name: name.value,
        email: email.value,
        comment: comment.value,
      }),
    })
      .then(() => navigate('/thanks/'))
      .catch((error) => alert(error))
    return await req
  }
)

// --snip--

const userSlice = createSlice<UserState, Reducer>({
  // --snip--
  extraReducers: (builder) => {
    builder.addCase(postContactForm.fulfilled, (state) => {
      state.isCompletedSubmit = true
    })
    builder.addCase(postContactForm.rejected, (state, { payload }) => {
      if (payload) {
        state.name.error = payload.nameError
        state.email.error = payload.emailError
        state.comment.error = payload.commentError
      }
    })
  },
})
```

redux-thunk で非同期処理を書く時って大抵 resolve や reject でそれぞれ dispatch したり、Promise 発行時の reducer と thunk にロジックが別れたりするので
redux-toolkit ではそれをより使いやすくまとめてて良いですね。
これならローダーとか追加したくなっても、thunk の中をいじる必要はないですからね。

## まとめ

### 良かった点

- Redux 初心者にもわかりやすい
- Slice を使ってれば ducks とか知らない人にも設計理解は容易
- Thunk の冗長性も排除されてて非同期処理も書きやすい
- 全体的に人によって書き方が異なるみたいなのをうまく排除してる
- SSR 考慮時の middleware 周りのだるさから解放される

### 気になる点

- Slice を使わず reducer とか作れると部分的に異なる書き方ができてしまう
- [immer の落とし穴](https://immerjs.github.io/immer/docs/pitfalls)を考慮しながら実装しなきゃいけなくなるので、immer がデフォルトなのは初心者には優しくない気もする
- Redux 単体で使うのがもはやアンチパターンなのかってくらいこういうのが流行ってるけど、何が何でも Redux の Core は拡張しないのだろうか（いろいろ[issue](https://github.com/reduxjs/redux/issues/3321)で議論されてたっぽいけど）

とまぁ、多少気になるところもありつつ、現状だとメリットの方が多い気がするので今後デファクトになっていくんじゃないかと期待。
あとが最近 React 公式から[Recoil](https://recoiljs.org/)も発表されたので、今後 React ユーザーがどっちを選んでいくのか要注目ですね。
