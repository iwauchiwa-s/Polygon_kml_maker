Polygon_kml_maker
Perl script "polymaker.pl"
version 1.0 (Sep. 2015)

Python script "polymaker.py"
version 1.0 (Sep. 2015)


 The followings are brief description in Japanese (UTF-8).

このPerlスクリプトは、経度、緯度、値の３列のcsvデータを読み込み、
Google Earthの地球儀上にポリゴンを表示するためのKMLファイルを作成します。

########＜読み込みデータの形式＞########

読み込みデータは以下のように作成してください。
csv（カンマ区切り）で、左から順に、「経度、緯度、値のデータ」を並べます。
経度と緯度のデータは「度の１０進数」です。「度分秒」のように、分と秒が６０進法の場合には、
あらかじめ、エクセルなどで、「=度+分/60+秒/3600」のような計算で「度の１０進数」を準備します。
経度は-180(W)〜+180(E)、緯度は-90(S)〜+90(N)ですので、西経や南緯では符号に注意してください。

（例）
 140.831042, 38.259415, xx.x  （最後のxx.xは観測値などの数値）

データファイルの名前は、"ge_data.csv"です。コードの該当部分を編集すれば変更可能です。
データの個数に制限などはありません。１個から描画できます。
（重要）unix環境をベースにしていますので、データファイルの文字コードはUTF-8、改行コードはLF（unix形式）にしてください。
（重要）データファイルは、このスクリプトと同じディレクトリに配置してください。

########＜出力ファイル＞########

出力ファイルの名前は、"polygon.kml"です。コードの該当部分を編集すれば変更可能です。
このスクリプトと同じディレクトリに自動で保存されます。
（重要）同じ名前のファイルがあっても、そのまま上書き保存されるので注意してください。
PCにGoogle Earth Proがインストールされていれば、".kml"の拡張子のファイルを直接開くことができます。
kmlファイルの中身はテキストであり、テキストエディタでも中身を開いてみることができます。

########＜ポリゴンのスタイル＞########

値の大小を、ポリゴンの高さの高低と、ポリゴンの色の変化で表現します。

ポリゴンの形状に関するパラメタは、以下のとおりです。
 $hgtBias  値に一定のバイアスをかけてから、ポリゴンの高さに使います。
 $hgtFact  バイアスをかけた後の数値を、適切なポリゴンの高さ（メートル）に拡大・縮小するための比例係数です。
 $polyWdt  ポリゴンの横幅の大きさ（メートル）を指定します。
 $posShft  ポリゴンを経度と緯度で指定される本来の位置から、緯度方向に少しずらす長さ（メートル）。

例えば、「1013 hPa」の「1013」という値に対して、$hgtBias=1000、$hgtFact = 5 とすると、
「ポリゴンの高さ」＝(1013 - 1000)*5　＝65 (m)　となります。ポリゴンの表示で、値の変化を強調するために使います。
したがって、どのような値をポリゴンで表現したいのか、その数値に依存して、これらのパラメタは変更しなければいけません。
なお、$posShft　は、同じ地点に複数の種類のポリゴンを配置するときにポリゴンが重なってしまうのを避けるために使用します。
１種類のポリゴンのみであれば、位置をずらす必要はないので、$posShft = 0　とします。

ポリゴンの色
ポリゴンの色に関するパラメタは、以下のとおりです。
 $rgb_min  値の最低値の色（１６進RGB値）
 $rgb_max  値の最大値の色（１６進RGB値）
 $trp      透明度（１６進）
ポリゴンの色を最低値と最大値で指定すると、それぞれの値に応じてRGB値を内挿計算して、自動でカラースケールを作ります。
最低値と最大値に同じ色を指定すると、ポリゴンの色は値に応じて変化せず、同じ色で描画されます。
データが１点、あるいは、全て同じ値のデータである場合には、$rgb_maxの色で描画します。
RGB値は、Red-Green-Blueの順番に、１６進（00〜ff）で与えます。
$trpはポリゴンの透明度を指定します。最大値ffが完全不透明、最低値00が完全透明、になります。

########＜スクリプトの実行＞########

標準でPerlの環境があるLinux、MacOS等を想定しています。
まず、shebang（先頭の#!以下のパス）をお使いのプラットフォームに合わせてください。
特定のperl モジュールを一切使っていないので、標準的な構成で実行可能です。


  << end of description in Japanese >>

