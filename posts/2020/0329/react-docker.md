---
title: 'フロントエンドエンジニアでも怖くないReact＋Docker構築'
archive: true
---

## Introduction

ちょっと前ですが、Node12 が LTS になりましたね。
喜ばしいことではあるんですが、実はちょっと前に Mac の Catalina と Node12 の掛け合わせで、Node gyp が動かずハマってちょっと苦労したことがありまして。
Docker で動くようちゃんと構築しておけば無駄に苦労せずに済んだのになーっと当時は思ったんですが、そこまで時間かけたくなかったのでその場しのぎで対応したりしてました。

その後困ったことはないんですが、必要になってからやってみても遅いなと思い、本サイトで Docker 環境を構築してみる事にしました。
他の記事でも書いてますが、本サイトは

- GatsbyJS
- Storybook
- Jest

を使用して開発しています。
なので今回はこの 3 つを Docker 上で動かせるようにしてみたいと思います。

### 環境情報

- Mac OS Mojave(10.14.5)
- Docker: 19.03.8
- Node: 12.14.1

npm script（一部抜粋）

```json
{
  "scripts": {
    "start": "gatsby develop & npm run storybook",
    "dev": "gatsby develop",
    "build": "gatsby build",
    "storybook": "start-storybook -p 6006",
    "storybook:docker": "start-storybook -p 6006 --ci --quiet",
    "test": "jest"
  }
}
```

### Docker 準備

まずは Docker をインストール。
https://hub.docker.com/editions/community/docker-ce-desktop-mac

インストールが終わったらアプリケーション開いて、ターミナルからバージョン確認できればとりあえず準備 OK。

```none
docker -v
```

## Docker 基礎知識

Docker には Docker Engine とかイメージとかコンテナとか、Docker を構築するいろいろがあるんですが、この辺をぼくなりの理解で解説していこうと思います。（誤りがあったらすいません、、、）

### Docker Engine

Mac で常駐する Docker をうごかすためのプログラムです。
Docker のワークフロー管理はこの Engine がいい感じにやってくれます。
Docker fot Mac とかいれたら、あとはこれを気にすることはほぼないです。

### イメージ

基本的に実行環境とは、「Linux 上で Node の 12.14.1 で React が 16 で・・・」みたいに階層別に分けられますよね。
このようなある Docker 環境を構築するのに必要になる階層的な土台 1 つ 1 つを Docker イメージと呼びます。

### Dockerfile

Docker イメージを構築する上で必要な設定情報を記述するのがこの Dockerfile です。
「Node のバージョンは幾つで、コマンドは何をしておけばよくて、コンテナ実行時のポートやコマンドは・・・」といった感じで環境に必要な情報を記述していきます。

### コンテナ

コンテナはアプリケーション実行環境です。
イメージを元に作成した環境上でアプリケーションソースを実行することができます。
基本的にこれが１開発環境だと思っていいかと思います。

### volumes

ボリュームはデータやファイルの永続化をおこなう場所です。
node_modules など、ローカルのリポジトリ上になくてもコンテナ上にはあってほしいものなどを記憶するのに使います。

### docker-compose

docker-compose はコンテナを複数立ち上げる時や冗長な起動コマンドを書かなくて済むようにする為のツールです。
Docker for Mac で同梱されており、コンテナの起動時の設定を docker-compose.yml に記述します。

## React（Gatsby）を Docker で動かす

### docker 設定周り

では早速アプリケーションの実行環境を構築していきたいと思います。
まずは Gatsby アプリケーションのルートに**Dockerfile**を作成し、以下を記述します。

```Dockerfile
FROM node:12.14.1

WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && npm ci
COPY . .
```

順番に説明すると、

1. node12 のイメージの上に構築
2. コンテナ上に app ディレクトリを作成し、その中で作業
3. ローカルにある**package.json**と**package-lock.json**をコピーして配置
4. ビルド時のみのコマンドを実行
5. **COPY . .** でアプリケーショソースをバンドル・コピー

という流れになっています。
ただし、ここで感の言い方はお気づきでしょうがこれだとローカルにある node_modules などもコンテナにコピーされてしまうのです。
こういった場合のために、アプリケーションのコピーから除外する為の設定として、**.dockerignore** 作成し、コピーする必要のないディレクトリを設定します。

```none
node_modules/
public/
.cache/
dist/
```

次に docker-compose.yml を書いていきます。

```yaml
version: '3'
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    command: 'npm run dev -- --host 0.0.0.0'
    ports:
      - '8000:8000'
    volumes:
      - /app/node_modules
      - .:/app
    environment:
      - NODE_ENV=development
```

ここで重要なのは gatsby の場合、**0.0.0.0** を指定しないと localhost でアクセスできないこと、port の指定をしないといけないこと、そして volumes の設定をしないといけないことです。

これで設定系の準備は完了です。

### コンテナを起動する

ではいよいよコンテナを起動したいと思います。
Dockerfile で書いた内容をまずは build します。

```none
docker-compose build
```

build は初回は時間がかかるので、気長に待ってください。
終わったら up コマンドでコンテナを起動してみましょう。

```none
docker-compose up
```

gatsby のコマンドログが流れて、localhost:8000 にアクセスできたらこれで完了です。
わかってしまえば割とすんなりコンテナ構築までいけました。
（途中 volumes らへんで詰まって僕は時間かかりましたが ww）

## Storybook のコンテナも作ってみる

storybook を運用している方も多いと思うので、同じ Dockerfile で storybook のコンテナも作ってみましょう。
（さっき立てたコンテナで作った Gatsby の環境と port 違うので同じ service 内に storybook も立てられると思うんですが、それだと storybook のビルドログと gatsby のビルドログが混じってわかりづらくなりそうだったので別で立てることにしました。）

さっき作成した Dockerfile に以下を追記して、build+up してみてください。

```yaml
storybook:
  build:
    context: .
    dockerfile: Dockerfile
  command: 'npm run storybook:docker'
  ports:
    - '6006:6006'
  volumes:
    - /app/node_modules
    - .:/app
  environment:
    - NODE_ENV=development
```

localhost:6006 で storybook が見れました。
application 側と同じような設定が多いので、共通設定にできないかいろいろやってみたのですがうまくいきませんでした。
Dockerfile の v2 だったら extends が使えるのですが、カオスになりやすい為なのか v3 からなくなっちゃってて代替案はあんまライトなのはなかったので諦めました。

## Jest も回しながら開発したい場合は？

このサイトは Jest で watch しながら開発してるので、Jest もコンテナ上で回せないと困ります。
ということで、もう一個コンテナを、、、
と思ったんですが、別にコンテナを立てなくてもコンテナに入れればよくね？と思い Jest 用にコンテナを立てるのはやめました。

以下のコマンドで Gatsby 用のコンテナへ入れるので、そこでテスト回せば OK です。

```none
docker-compose exec web bash
npm t
```

## まとめ

ざっとですが Docker で Gatsby 開発環境を構築できました。
チーム開発してると環境構築で Docker とか Vagrant ないと結構時間取られるので、やはりこういった仮想系の環境構築は偉大ですね。
しかも Docker 思いの外シンプルで結構わかりやすい。
もっといろいろ詰まるかと思ってたんですが、どうやら食わず嫌いだったみたいです。
（とかいってると本職な方々からえらいつっこみくらうかもしれないですけど・・・）

今回はそんな感じで。
