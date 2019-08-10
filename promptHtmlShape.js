const enumPoker = require('./enum');
const sendPrompt = require('./mephisto_socket');

const oracledb = require('oracledb');


const createPrompt = (pokerType = 'spins', pokerRoom = 'party-poker') => {
    return `
        <div class="main-container ${pokerType} ${pokerRoom}">
            ${createPlayers()}
            ${createBoard()}
            ${createHeroHand()}
            ${createPrompt()}
        </div>`;
};

const createPlayers = (players = []) => {

};

const createPlayer = (recognitionPosition) => {

};

const createBoard = (board) => {

};

const createHeroHand = (hand) => {

};

const getStats = (playerID) => {
    oracledb.getConnection(
        {
            user          : "VERTER",
            password      : "1ZHo2lZfT10Q5",
            connectString : "Localhost/vert"
        },
        (err, connection) => {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT * FROM EE_PLAYERS_STATS WHERE ID = ${playerID}`,
                function(err, result) {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                        return false;
                    }
                    if(result.rows.length >= 0) {
                        console.log(result.rows);
                        doRelease(connection);
                        return false;
                    }
                });
        });

    const doRelease = (connection) => {
        connection.close(
            function(err) {
                if (err)
                    console.error(err.message);
            });
    }
};

let currentPrompt =
    `<div class="main-container spins party-poker">
        <div class="player player0">
            <div class="nickname green">Joe <span class="balance">/ 23bb</span></div>
            <div>
                <span class="stat green">VPIP: 54, </span><span class="stat">PFR: 19, </span><span class="stat">3Bet: 13</span>
            </div>
            <div>
                <span class="stat">CBet: 45, </span><span class="stat green">Raise%: 9, </span><span class="stat">Call%: 55</span>
            </div>
            <div class="dealer"><span>D</span></div>
            <div class="amount bet-raise">bet: 5bb</div>
        </div>
        <div class="player player1">
            <div class="nickname red">checkmate <span class="balance">/ 16bb</span></div>
            <div>
                <span class="stat red">VPIP: 17, </span><span class="stat">PFR: 16, </span><span class="stat">3Bet: 20</span>
            </div>
            <div>
                <span class="stat">CBet: 65, </span><span class="stat red">Raise%: 25, </span><span class="stat">Call%: 42</span>
            </div>
            <div class="amount check-call">check</div>
        </div>
        <div class="player player2">
            <div class="nickname">See my luck <span class="balance">/ 27bb</span></div>
            <div>
                <span class="stat">VPIP: 30, </span><span class="stat">PFR: 23, </span><span class="stat">3Bet: 15</span>
            </div>
            <div>
                <span class="stat">CBet: 55, </span><span class="stat">Raise%: 12, </span><span class="stat">Call%: 40</span>
            </div>
        </div>
        <div class="board">
            <div class="pot">Pot: 10bb</div>
            <div class="card spades">
                <div class="value">A</div>
                <div class="suit">&#9824</div>
            </div>
            <div class="card clubs">
                <div class="value">8</div>
                <div class="suit">&#9827</div>
            </div>
            <div class="card hearts">
                <div class="value">T</div>
                <div class="suit">&#9829</div>
            </div>
            <div class="card diamonds">
                <div class="value">Q</div>
                <div class="suit">&#9830</div>
            </div>
            <div class="card diamonds">
                <div class="value">2</div>
                <div class="suit">&#9830</div>
            </div>
        </div>
        <div class="hero-hand">
            <div class="card diamonds">
                <div class="value">T</div>
                <div class="suit">&#9830</div>
            </div>
            <div class="card spades">
                <div class="value">T</div>
                <div class="suit">&#9824</div>
            </div>
        </div>
        <div class="prompt">
            <div class="bet-raise red">
                Raise: 25bb
            </div>
            <div class="diagram">
                <div class="fold" style="width: 10%"></div>
                <div class="check-call" style="width: 35%"></div>
                <div class="bet-raise" style="width: 55%"></div>
            </div>
            <div class="sizings">
                <table>
                    <tr style="opacity: 0.25">
                        <td class="check-call">Call</td>
                        <td class="ev">EV: 5bb</td>
                    </tr>
                    <tr style="opacity: 0.3">
                        <td class="bet-raise">Raise: 1pot</td>
                        <td class="ev">EV: 10bb</td>
                    </tr>
                    <tr style="opacity: 0.5">
                        <td class="bet-raise">Raise: 1.6pot</td>
                        <td class="ev">EV: 13bb</td>
                    </tr>
                    <tr>
                        <td class="bet-raise">Raise: 2.5pot</td>
                        <td class="ev">EV: 15bb</td>
                    </tr>
                    <tr style="opacity: 0.7">
                        <td class="bet-raise">All-in</td>
                        <td class="ev">EV: 14bb</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>`;

