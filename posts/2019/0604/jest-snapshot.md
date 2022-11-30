---
title: 'JestのSnapshotテストに感動した話'
archive: true
---

## Introduction

恥ずかしながら Javascript で Unit テストを書いたことがなかったんですが、ふとと思いたって導入してみました。
PHP の Unit テストや E2E は書いたことあるんですが、どれもメリデメが大きいというか、「正しく投資すれば正しくメリットを享受できる」っていうイメージでした。

そもそもフロントにテストいれてどの程度有用なのかっていうのがイメージしづらいなーって思ってました。
View の開発時にテスト駆動開発みたいなのやろうと思うと「それブラウザ見たほうが早くね？」みたいな。

でもまぁものは試し、と思って Storybook や Redux にテスト入れてみようと思ったらこれが非常に便利。
ということで非常に感動した Snapshot テストについて書いていこうと思います。

## どんなテストが有用か

そもそも Javascript でテストを書く場合、どういうテストがあるんだろう？
「ボタンをクリックしたら Callback が呼ばれる」みたいなテストをこのサイトに導入してもあんまメリットなさそうだなぁ。。。
なんて思いながら色々調べてみたら、**Snapshot テスト**なるものにたどり着きました。

### Snapshot テスト

Snapshot テストって聞くと、「キャプチャとって比較すんの？」ってイメージする人も多いかもしれません。
まぁあながち間違いじゃないというか、かなり近しいです。が、キャプチャをとるテストのことじゃありません。

Snapshot テストとは、「テスト実行時に Snapshot（何かしらの実行結果）を作成し、前回の Snapshot があれば比較することでテストを行う」ものになります。
この Snapshot はキャプチャでもいいし、String でも言いわけです。
なので例えば React だと Component をシリアライズした結果をファイルにして、前後比較したりします。

いわゆるリグレッションテストですね。

## Component の Snapshot テスト

たしかに Snapshot テストはこのサイトでも非常に有用なきがします。
本サイトは React 製なので、Component の Snapshot テストから書いていこうと思います。

さて、どう書いていこうかなーなんて調べてたら、前回導入した**Storybook**のアドオンで Snapshot テストが簡単にかけるらしい。
ということで早速環境構築。

### Jest

まず Snapshot をするために**Jest**を導入します。
Jest は React 同様 Facebook が開発してるオープンソースです。
詳しい説明は省きますが、React でテスト書こうと思ったらとりあえず Jest から始めるのがスタンダードかと思います。

```none
npm i -D jest
```

適宜 jest-config など修正しつつ、試しに実行。

```javascript
import * as React from 'react'
import * as renderer from 'react-test-renderer'

import MainTitle from './index'

describe('MainTitle', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<MainTitle title="Multi Title" category="BLOG" />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
```

無事\_\_snapshots\_\_というディレクトリに Snapshot ファイルが生成され、変更時にエラーが発生するようになりました。

### @storybook/addon-storyshots

無事実行できたのはいいんですが、どうやら Storybook のアドオンでいい感じにテストができるらしい。
ということでアドオン導入してみました。

```none
npm i -D @storybook/addon-storyshots
```

```javascript
import initStoryshots from '@storybook/addon-storyshots'

initStoryshots({
  /* configuration options */
})
```

これだけで Story ごとの Snapshot テストをしてくれるというお手軽さ。
簡単すぎて拍子抜けですが、そもそも Story 自体が半ばテストみたいなところがあるのに別途テストも書くって、って本体より書く量ふえるやん！みたいなしんどさが発生しないから非常に有用ですね。

## Reducer のテスト

Component のテストを書いたらあとは書くところといえばやはり Redux ですよね。
本サイトの action creator は特にロジックもなく payload 受け取って流すだけ、かつ Typescript による型制約もあるので予期せぬ型が入ることもまずない。
ということでテストは書かずともまぁまずバグは起こらなそう。

なので本サイトでは、Reducer にのみテストを書いていこうと思います。

### 本サイトの Redux 構成

以前のエントリでも書いたんですが、本サイトでは Redux は以下のような構成を取っています。
今回の話からは少しそれますが、サンプルが本サイトのものなので、一応記載しておきます。

- typescript
- typescript-fsa
- typescript-fsa-reducers
- ImmutableJS
- ducks（ファイル構成）

### Reducer の Snapshot

本サイトの Reducer とテストを実際に書いてみました。

```javascript
import { Record } from 'immutable'
import actionCreatorFactory from 'typescript-fsa'
import { reducerWithInitialState } from 'typescript-fsa-reducers'

// model
export interface IFormMember {
  isChanged: boolean;
}

export const FormModel = Record<IFormMember>({
  isChanged: false,
})

// action
const actionCreator = actionCreatorFactory()

enum ActionType {
  Change = 'FORM/CHANGE',
}

export const changeAction = actionCreator(ActionType.Change)

// reducer
const reducer = reducerWithInitialState(new FormModel())
  .case(changeAction, (state) => state.set('isChanged', true))

export default reducer
```

```javascript
import * as snapshotDiff from 'snapshot-diff'
import reducer, { FormModel, changeAction } from './form'

const initialState = new FormModel()

test('[form ui state]: init', () => {
  expect(
    snapshotDiff(undefined, reducer(undefined, { type: '@@INIT' }))
  ).toMatchSnapshot()
})

test('[form ui state]: change', () => {
  expect(
    snapshotDiff(initialState, reducer(initialState, changeAction()))
  ).toMatchSnapshot()
})
```

**@@INIT**は Redux の初期化時に発火する特殊な action です。
上記のサンプルは payload がない action だから 1 個ですが、何かしら payload 渡す場合も expected 値を書く必要がないので基本コピペで十分ですね。

## 感想

Snapshot テスト、すごいですね。
すごく浅いこというと、今時なテスト感ありますよね。

しかもこれ、うまくやればテスト駆動しながら使えそう。
調べたら PHP や Ruby でも Snapshot テストのライブラリなどもあるみたいなので、サーバーサイドのテストでもちょっと使ってみようかと思います。
