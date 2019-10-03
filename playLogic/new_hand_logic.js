const config = {
    'Spin&Go': {
        heroChair: 2,   // смотрим в конфиге для вида покера Spin&Go стул хиро: spin&go = 2 (практически всегда это нижний игрок)
        // stuff
    },
    // stuff
};

const prevFrame = {
    Card1_suit: 'none',
    Card1_value: 'none',
    Player0_hole1_suit: 's',
    Player0_hole1_value: '7',
    Player0_isDealer: true,
    // stuff
};

const curFrame = {
    Card1_suit: 'none',
    Card1_value: 'none',
    Player0_hole1_suit: 's',
    Player0_hole1_value: '7',
    Player0_isDealer: true,
    // stuff
};

// board
const c1Diff = ((curFrame.Card1_suit !== prevFrame.Card1_suit || curFrame.Card1_value !== prevFrame.Card1_value) && curFrame.Card1_suit === 'none') ? 1 : 0;
const c2Diff = ((curFrame.Card2_suit !== prevFrame.Card2_suit || curFrame.Card2_value !== prevFrame.Card2_value) && curFrame.Card1_suit === 'none') ? 1 : 0;
const c3Diff = ((curFrame.Card3_suit !== prevFrame.Card3_suit || curFrame.Card3_value !== prevFrame.Card3_value) && curFrame.Card1_suit === 'none') ? 1 : 0;
const c4Diff = ((curFrame.Card4_suit !== prevFrame.Card4_suit || curFrame.Card4_value !== prevFrame.Card4_value) && curFrame.Card1_suit === 'none') ? 1 : 0;
const c5Diff = ((curFrame.Card5_suit !== prevFrame.Card5_suit || curFrame.Card5_value !== prevFrame.Card5_value) && curFrame.Card1_suit === 'none') ? 1 : 0;

const sumBoardCardsDiff = c1Diff + c2Diff + c3Diff + c4Diff + c5Diff;

// dealer
const player0DealerDiff = curFrame.Player0_isDealer !== prevFrame.Player0_isDealer ? 1 : 0;
const player1DealerDiff = curFrame.Player1_isDealer !== prevFrame.Player1_isDealer ? 1 : 0;
const player2DealerDiff = curFrame.Player2_isDealer !== prevFrame.Player2_isDealer ? 1 : 0;
// .........
// etc up to player9

const isDealerMoved = player0DealerDiff + player1DealerDiff + player2DealerDiff + ... + player9DealerDiff === 2; // 2 - one disappeared and another one appeared

// hero
const isHeroCardsChanged = curFrame.Player2_hole1_suit !== prevFrame.Player2_hole1_suit  // one and more cards have changed
    || curFrame.Player2_hole1_value !== prevFrame.Player2_hole1_value
    || curFrame.Player2_hole2_suit !== prevFrame.Player2_hole2_suit
    || curFrame.Player2_hole2_value !== prevFrame.Player2_hole2_value;

// final test
if (sumBoardCardsDiff > 1 || (isHeroCardsChanged && isDealerMoved)) {      // new hand!!!
    // 1) сбрасываем кэш никнеймов, карт борда и игроков
    // 2) определяем тяжелыми сетями никнеймы, а так же карты игроков которые распознаны как не 'none' легкими сетями(почти всегда это только хиро)
    // 3) ждем когда легкие сети распознают конкретную масть и номинал карты и включаем распознавание тяжелыми сетями и записываем их в кэш!
    //  3.1) если тяжелые сети определили карту как 'none', повторить распознавание в след фрейме если легкие сети распознали конкретную карту(страховка для пункта 3)
    // 4) слать по сети, а так же логировать все карты и никнеймы ТОЛЬКО ИЗ КЭША, куда пишут ТОЛЬКО ТЯЖЕЛЫЕ СЕТИ
}







