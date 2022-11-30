---
title: 'Typescript & Redux & ImmutableJSでreducerを１行にする'
archive: true
---

## Introduction

このサイトでは一部 Redux を使用しているのですが、ちょっとやりづらさを感じたので思い切っていろいろ書き換えてみることにしました。
やりたかったのは

- Reducer の冗長部分の解消
- state や props の型推論

の 2 つです。
ということで今回は ImmutableJS による Model の導入と Typescript の導入をやってみました。

## 書き換え前の実装

書き換え前の段階では**redux-actions**で action creator や reducer を実装していました。
一部ソースを載せるとこんな感じです。

```javascript
import { createActions, handleActions } from 'redux-actions'
import { nameValidate } from '../utils/contactValidater'

// actions
const {
  user: { name },
} = createActions({
  NAME: {
    UPDATE: (value) => value,
  },
})

export const updateName = name.update

// reducer
const reducer = handleActions(
  new Map([
    [
      updateName,
      (state, { payload }) => {
        const error = nameValidate(payload)
        return {
          ...state,
          name: {
            value: payload,
            error,
          },
        }
      },
    ],
  ]),
  initialState
)

export default reducer
```

action creator はシンプルですが reducer はちょっと長いですね。。。
実装中は payload の渡し方をミスって name に string 渡しちゃったりしたこともありました。

ちなみにちょっと脱線するんですが、上記のようにぼくは action と reducer をまとめて記述する Ducks という設計を取っています（最近知りました）。
やってみると結構 Redux のサンプルとかでよくある redux-way という手法と比べ、いちいちファイルを跨がないから非常にわかりやすかったです。

## ImmutableJS で Redux に Model を追加する

ImmutableJS は React 同様 Facebook が作ってるライブラリで、Immutable なデータ構造を提供します。
具体的には、**List**, **Stack**, **Map**, **OrderedMap**, **Set**, **OrderedSet**, **Record**などを提供します。

先述のわかりづらい reducer からどうにかしようということで、この ImmutableJS の Record を継承して Model を作ることにしました。
Redux における Model は state の生成ロジックを担い、reducer は交通整備のみに責務を集中する形になります。
また一部省略してますがソースを乗っけるとこんな感じになりました。

```javascript
import { Record } from 'immutable'
import { createActions, handleActions } from 'redux-actions'
import { nameValidate } from '../utils/contactValidater'

// model
const UserRecord = Record({
  name: {
    value: '',
    error: '',
  },
})

class UserModel extends UserRecord {
  updateName(value) {
    const error = nameValidate(value)
    return this.withMutations((mut) =>
      mut.setIn(['name', 'value'], value).setIn(['name', 'error'], error)
    )
  }
}

// actions
const {
  user: { name },
} = createActions({
  USER: {
    NAME: {
      UPDATE: (value) => value,
    },
  },
})

export const updateName = name.update

// reducer
const reducer = handleActions(
  new Map([[updateName, (state, { payload }) => state.updateName(payload)]]),
  new UserModel()
)

export default reducer
```

これにより

- reducer が短くなった
- reducer の戻り値の型ロジックを Record に移譲できた
- payload の適用ロジックがみやすくなった

というメリットを受けることができました。
ちなみに、Record.withMutations を使ってるのは、複数の処理を挟む時にこのやり方が一番早いのでそうしました。
他のメソッドだといちいち内部的に Record を new して返却しちゃうので、複数の値をいじるような場合には要注意です。

## Typescript で state の型推論をする

これで reducer は綺麗になったけど、まだ問題が残ってます。
そう、state の型推論がしたい。

ということで、ここから Typescript に書き換えようと思ったんですが、どうも redux actions は typescript で書きずらい。。。
なかなか推論してくれなくてキャストしたりしなきゃいけなかったり、Interface を引き回して最終的な state の型を自前で定義することになったり、、、

まぁこの辺は普通に僕の調査不足で redux actions でも普通に楽にかけるのかもしれませんが、どうやら調べてたら typescript 使うなら redux-actionts より**typescript-fsa**っていうライブラリがいいらしい。
reducer のロジックは Model に分離したおかげで変更もそこまでかからなそうだし、typescript-fsa でさらに redux を書き換えてみました。

```javascript
import { Record } from 'immutable'
import actionCreatorFactory from 'typescript-fsa'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { nameValidate } from '../../utils/contactValidater'

// model
export interface IUserMember {
  name: {
    value: string;
    error: string;
  },
}

const UserRecord = Record<IUserMember>({
  name: {
    value: '',
    error: '',
  },
})

class UserModel extends UserRecord {
  updateName(value: string) {
    const error = nameValidate(value)
    return this.withMutations(mut => mut.setIn(['name', 'value'], value).setIn(['name', 'error'], error))
  }
}

// action
const actionCreator = actionCreatorFactory()

enum ActionType {
  UpdateName = 'USER/NAME/UPDATE',
}

export const updateNameAction = actionCreator<string>(ActionType.UpdateName)

// reducer
const reducer = reducerWithInitialState(new UserModel())
  .case(updateNameAction, (state, payload) => state.updateName(payload))

export default reducer
```

Map の代わりに reducerWithInitialState.case 内で reducer ロジックを書くことになっただけで、そこまで変わらなかったです。
強いて言えば redux actions の createActions の書き方のように、action 名を string でいちいち記述しない方式がすごい好きだったので残念ですが、
代わりに enum を使えるようになったので結果としてはまぁいっかという感じです。

これで準備は整ったので、あとは state 生成や container conpoment で型推論が効くようになれば完璧です！

### combineReducers で型推論させたい

Redux の公式にもあるんですが、state の設計時に domain や ui,app など上位で責務わけしちゃうほうがいいよー、って考え方があります。
このサイトでもやってるのですが、上記サンプルだと combineReducers を複数回挟むと型推論が消えます。
ですが combineReducers に型変数を渡してあげればいい感じに推論してくれるようになります。

```javascript
import { combineReducers } from 'redux'
import user, { IUserMember } from './modules/app/user'

interface UserState {
  user: IUserMember;
}

const app = combineReducers < UserState > { user }

const root = combineReducers({
  app,
})

export default root
```

### container component で型推論させたい

上記までいけば container component の mapStateToProps で推論させるのはもう簡単です。
Typescript の ReturnType を使って store.getState の型を取得するだけです。

```javascript
type AllState = ReturnType<typeof store.getState>

const mapStateToProps = (state: AllState) => ({
  name: state.app.user.name,
})
```

簡単ですね。

## 感想

typescript-fsa の github のスターが結構少なめだったからちょっと不安だったけど、普通にめっちゃ便利でした。
やっぱ state の推論までしてくれると非常に便利ですね。

ただ Gatsby と Typescript がそこまで相性が良くないというか、、、
トランスパイル時にエラー吐いてくれないんですよね。
ちょっとそこは残念ですが、まぁ別にターミナルにエラー吐かないだけで IDE がめっちゃ怒ってきてくれるから使うメリットはあるかなと思います。

だから結論としては Typescript + Webstorm が最強ってことで…ww
