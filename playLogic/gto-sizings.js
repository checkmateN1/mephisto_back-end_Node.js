let smart_stack;

//////////////////////////////////////////////////////////////// PREFLOP
/////////////////// HU
//2bet - first move
if (smart_stack > 23bb) {
  [1/2]                       // [2bb]   // !!! only 2bb
} else {
  [1/2, allin]                // [2bb, allin]
}

// 2bet - after limp
if (smart_stack < 8bb) {
  [1/2...3/4, allin]            //[2bb..2.5bb  ,allin]
} else if (smart_stack < 13bb) {
  [3/4...1, allin]              //[2.5bb..3  ,allin]
} else {
  [1...5/4, allin]              //[3bb..3.5, allin]
}

//3bet BB
[5/8...3/4, allin]            //[4.5bb..5bb, allin]

//4bet or limp-3bet
allin



///////////////////////// Multipot
//////// 2bet
//BTN
2bb

// SB
  [1/2...1, allin]                //[2bb..3bb, allin]

// BB - after limp
if (smart_stack < 8bb) {
  [1/2...4/5, allin]              //[2bb..2.5bb  ,allin]
} else if (smart_stack < 12bb) {
  [4/5...1, allin]                //[2.5bb..3  ,allin]
} else {
  [1...5/4, allin]                //[3bb..3.5, allin]
}

//////// 3bet
[5/8...4/5, allin]  /// X DRN 2,5х opponent's amount(raise amount 3 - 3bet 7...8(AVG 7.5))

//////// 4bet or limp-3bet
allin


/// new ranges preflop
//0 - call
//1 - fold
//2 - (0..1/2]
//3 - (1/2..1]
//4 - (1...5/4]
//5 - (5/4...10000]   // allin



////////////////////////////////////////////////////////////////////// POSTFLOP

// new ranges postflop
//0 - call
//1 - fold
//2 - (0..2/5]
//3 - (2/5..3/5]
//4 - (3/5...9/10]
//5 - (9/10...11/10]
//6 - allin   // allin if (smart_stack < 15bb || pot > 8bb)