// 面の定義。計算は src/logic に置き、ここは配置と文だけを持つ。数字は challenges.js の問題で決まる面がある。
// items の1行は [重さ, 名前]。積み方の面は [重さ, 名前, 幅, 高さ, 色]
export const STAGES=[
 {id:'w1',name:'水 1　はじめの航路',start:'water',cradle:true,generated:true,window:1,maxAnswers:4,on:[],gates:[{k:'shoal',x:300},{k:'bridge',x:560}],end:800,
  lead:'船を水に浮かべます。',winner:'計算どおりだな。出航の前に、深さを予想するのだぞ。'},
 {id:'w2',name:'水 2　細い水路',start:'water',cradle:true,generated:true,window:0.5,maxAnswers:3,on:[],gates:[{k:'bridge',x:300},{k:'shoal',x:560}],end:800,
  lead:'通れる深さの幅が、せまくなりました。',winner:'選べる重さが少ないほど、計算が役に立つ。'},
 {id:'w3',name:'水 3　別の船',start:'water',cradle:true,generated:true,window:0.5,maxAnswers:3,areas:[8,12],on:[],gates:[{k:'shoal',x:300},{k:'bridge',x:560}],end:800,
  lead:'今度は船の底面積が違います。',winner:'底が広いほど、同じ荷でも浅く沈むのだ。'},
 {id:'w4',name:'水 4　積み方',intro:['s7'],start:'water',cradle:true,grid:true,generated:true,count:4,gap:1,on:[],gates:[{k:'bridge',x:320}],end:640,
  lead:'荷はすべて運びます。荷を選び、積む列をタップしましょう。',winner:'沈み方だけでなく、積み方も大事なのだ。軽い木ほど、場所をとるぞ。'},
 {id:'w5',name:'水 5　山積みの港',start:'water',cradle:true,grid:true,generated:true,count:5,gap:0.5,on:[],gates:[{k:'shoal',x:300},{k:'bridge',x:560}],end:800,
  lead:'荷が増えました。沈み方と積み方の両方を考えましょう。',winner:'見事だ。では次は、水ではない液体を測ってごらん。'},
 {id:'oil1',name:'油の面',intro:['s8'],start:'water',on:[0,1,2,3],items:[[12,'鉄'],[10,'壺'],[8,'麦袋'],[5,'木箱']],gates:[{k:'chamber',x:300,to:'oil'},{k:'bridge',x:620,d:4.5}],end:860,
  goal:'入れ替え室の先は油です。油の先の低い橋は、深さ4.5以上で通れます。荷物を調整してから進みましょう。',
  winner:'水より軽い液体では、同じ荷でも深く沈むのだ。'},
 {id:'merc1',name:'水銀の面',intro:['s6'],start:'water',pre:'mercury',on:[],items:[[10,'木箱'],[10,'木箱'],[10,'木箱'],[10,'木箱'],[10,'木箱'],[10,'木箱'],[20,'鉄箱'],[20,'鉄箱'],[20,'鉄箱'],[20,'鉄箱'],[100,'金塊'],[100,'金塊'],[100,'金塊'],[100,'金塊']],gates:[{k:'lever',x:320,d:3},{k:'shoal',x:580,d:3.5}],end:800,
  goal:'水中のレバーは深さ3以上で届き、門が開きます。その先の浅瀬は深さ3.5以下です。',
  winner:'沈まぬことが、困りごとになることもあるのだ。さて、次は何を測る？'}
];
