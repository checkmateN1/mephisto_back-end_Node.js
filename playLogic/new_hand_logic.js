const heroChair = 2;     // взять из конфига для spin&go
const playersCount = 3;   // взять из конфига для spin&go

function checkNewHand(prevFrame, curFrame, heroChair, playersCount) {
    // cur hero
    const hole1_suit = curFrame[`Player${heroChair}_hole1_suit`].value;
    const hole2_suit = curFrame[`Player${heroChair}_hole2_suit`].value;
    const hole1_value = curFrame[`Player${heroChair}_hole1_value`].value;
    const hole2_value = curFrame[`Player${heroChair}_hole2_value`].value;

    const isHeroHand = hole1_suit !== 'None' && hole2_suit !== 'None' && hole1_value !== 'None' && hole2_value !== 'None';


    if (prevFrame === null && isHeroHand) {         // самый первый фрейм. Если предыдущего не было и видим валидную руку хиро
        return true;
    }

    // board
    const sumBoardCardsDiff = Array(5).fill().reduce((sum, card, i) => {    // аналогично циклу for на 5 итераций - суммируем изменения карт борда
        return sum + (((prevFrame[`Card${i+1}_suit`].value !== 'None'                 // максимальное число изменений 5.. если 0 карты борда остались такими же
            || prevFrame[`Card${i+1}_value`].value !== 'None')
            && curFrame[`Card${i+1}_suit`].value === 'None') ? 1 : 0);
    }, 0);

    // dealer
    const isDealerMoved = Array(playersCount).fill().reduce((count, pl, i) => {     // подсчитываем количество диллеров изменивших состояние
        const isChanged = curFrame[`Player${i}_isDealer`].value !== prevFrame[`Player${i}_isDealer`].value;
        return count + (isChanged ? 1 : 0);
    }, 0) === 2; // 2 - one disappeared and another one appeared

    // prev hero
    const prev_hole1_suit = prevFrame[`Player${heroChair}_hole1_suit`].value;
    const prev_hole2_suit = prevFrame[`Player${heroChair}_hole2_suit`].value;
    const prev_hole1_value = prevFrame[`Player${heroChair}_hole1_value`].value;
    const prev_hole2_value = prevFrame[`Player${heroChair}_hole2_value`].value;

    const isHeroCardsChanged = hole1_suit !== prev_hole1_suit  // one and more cards have changed
        || hole1_value !== prev_hole1_value
        || hole2_suit !== prev_hole2_suit
        || hole2_value !== prev_hole2_value;

    return (sumBoardCardsDiff > 1 || isHeroCardsChanged || isDealerMoved) && isHeroHand;
}








