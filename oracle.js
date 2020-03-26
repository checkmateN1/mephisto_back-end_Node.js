const oracledb = require('oracledb');

const enumPoker = require('./enum');

const isAdaptation = false;

///////////////////////////////////////////////////////////////////// PLAYERS
class PlayersHandler {
  constructor() {
    this.cashPlayers = {};      // nickname: id
    this.players = {};          // id: adaptation
    this.defaultAdaptation = [1,1,1,1,1,1,1,1,1,1,1,1,1,1];
  }

  static getPlayerIdFromDB(player, token, room, gameType, isAdaptation) {
    if (token) {
      return enumPoker.tokens[token][room][gameType];
    } else if (isAdaptation) {
      // db query
    } else {
      return 0;
    }
  }

  static getAdaptationFromDB(id, room) {
    return [1,1,1,1,1,1,1,1,1,1,1,1,1,1];        // will implementing
  }

  static getRoomId(room) {
    return enumPoker.rooms[room];
  }

  setPlayer(recognitionNickname) {
    let playerID = this.getPlayerIdFromDB(recognitionNickname);
    let adaptation = this.getAdaptationFromDB(playerID);

    if (playerID) {
      this.cashPlayers[recognitionNickname] = playerID;
    }
    if (adaptation && adaptation.length) {
      this.players.playerID = adaptation;
    }
  }

  getAdaptation(recognitionNickname) {
    let adaptation = this.players[this.cashPlayers.recognitionNickname];

    if (adaptation && adaptation.length) {
      return adaptation;
    }
    this.setPlayer(recognitionNickname);
    adaptation = this.players[this.cashPlayers.recognitionNickname];

    if (adaptation && adaptation.length) {
      return adaptation;
    }
    return this.defaultAdaptation;
  }
}

class Player {
  constructor(id, adaptation) {
    this.id = id;
    this.adaptation = adaptation;
  }
}


const testInitPlayers = [
  {
    player: 'player_0',
    initBalance: 2600,
    enumPosition: 0,
    isDealer: true,
    cards: null
  },
  {
    player: 'player_1',
    initBalance: 2400,
    enumPosition: 9,
    isDealer: false,
    cards: null
  },
  {
    player: 'player_2',
    initBalance: 2500,
    enumPosition: 8,
    isDealer: false,
    cards: {
      hole1Value: '2',
      hole2Value: '7',
      hole1Suit: 's',
      hole2Suit: 'c'
    }
  }
];

//////////////////////////////////////////////////// DB
class Oracle {
  constructor() {
    this.connection = null;
    this.connect();
  }

  async connect() {
    await oracledb.getConnection({
        user          : "VERTER",
        password      : "1ZHo2lZfT10Q5",
        connectString : "192.168.1.30:1521/VERTER"
      },
      async (err, connection) => {
        if (err) {
          console.error(err.message);
          return;
        }
        if (connection) {
          this.connection = connection;
        }

      }
    );
  }

  async testSelect() {
    if (this.connection) {
      const sql = `SELECT * FROM EE_BRAK`;
      const binds = {};

      // For a complete list of options see the documentation.
      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
        // extendedMetaData: true,   // get extra metadata
        // fetchArraySize: 100       // internal buffer allocation size for tuning
      };

      const result = await this.connection.execute(sql, binds, options);

      console.log("Column metadata: ", result.metaData);
      console.log("Query results: ");
      console.log(result.rows);
    }
  }

  async loggingHandHistory(options) {
    if (this.connection) {
      const {
        rawActions,
        initPlayers = testInitPlayers,
        heroChair,
        room,
        gameType,
        limit,
        board,
        plCount,
        cash,
        token,      // вычисляем по токену и id_room - player_id
      } = options;

      const id_room = enumPoker.rooms[room];

      const newHandId = await this.insertHand(id_room, limit, board, plCount);                   // tt_hands
      const players = await this.insertRawInit(newHandId, initPlayers, token, room, gameType);   // raw_init
      const actions = await this.insertRawActions(players, rawActions, newHandId);               // tt_raw_actions


      await this.connection.commit();
    }
  }

  async insertRawActions(players, rawActions, newHandId) {
    // raw actions
    // Amount = invest if call or превышение над максимальной если агро
    // тип действия 6 если агро оллын
    // блайнды это улица 0, префлоп это улица 1
    // ACT_NUM начинается всегда с 1
    // PRE_BET - предыдущий амаунт игрока в пределах одной улицы. Улица 0 и 1 это одна улица
    // MAX_BET - макс ставка на текущей улице до данного мува(если текущий рейз бета, то макс бет - амаунт бета)

    // ID_HAND, ACT_NUM, STREET, ID_PLAYER, ID_ACTION, AMOUNT, PRE_POT, PRE_BET, PRE_STACK, MAX_BET

    let prevStreet = 0;
    let prevAction = 0;
    let maxAmount = 0;
    let prevBets = {};
    let prevStacks = {};
    const actions = rawActions.map( (action) => {
      // players [[newHandId, ID_PLAYER, player.initBalance, player.enumPosition], ...];
      const playerId = players.filter(player => player[3] === action.position)[1];
      let street;
      if (action.action === 0) {   // post
        street = 0;
      } else {
        street = action.street + 1;
      }
      prevStreet = street;

      let curAction;
      let MAX_BET;
      if (prevStreet === street) {
        curAction = prevAction + 1;
        MAX_BET = maxAmount;
      } else {
        if (street < 2) {
          MAX_BET = maxAmount;
        } else {
          MAX_BET = 0;
          maxAmount = action.invest;
          prevBets = {};
        }
        curAction = 1;
      }
      prevAction = curAction;

      let amount;
      if (action.action < 3) {
        amount = action.amount - MAX_BET;
        maxAmount = amount;
      } else {
        if (action.action === 0) {
          maxAmount = action.invest;
        }
        amount = action.invest;
      }

      const PRE_BET = prevBets[playerId] !== undefined ? prevBets[playerId] : 0;
      prevBets[playerId] = amount;

      const PRE_STACK = prevStacks[playerId] !== undefined ? prevStacks[playerId] : players.filter(player => player[3] === action.position)[2];
      prevStacks[playerId] = PRE_STACK - action.invest;

      return [newHandId, curAction, street, playerId, action.action, amount, action.pot, PRE_BET, PRE_STACK, MAX_BET];
    });

    try {
      const sql = `INSERT INTO tt_raw_actions VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)`;
      const result = await this.connection.executeMany(
        sql,
        actions,
      );
      console.log('insertRawActions result');
      console.log(result);

    } catch (e) {
      console.error(e.message);
    }

  }

  async insertHand(id_room, limit, board, plCount) {      // tt_hands
    if (this.connection) {
      try {
        const {
          C1 = '',
          C2 = '',
          C3 = '',
          C4 = '',
          C5 = '',
        } = board;
        const sql = `INSERT INTO tt_hands (ID, ID_ROOM, HANDNUM, LM, DT, C1, C2, C3, C4, C5, PL_COUNT) VALUES (handnumberid_seq.nextval, :id_room, handnumberid_seq.nextval, :limit, CURRENT_DATE, :C1, :C2, :C3, :C4, :C5, :plCount) RETURN ID INTO :id`;

        const result = await this.connection.execute(
          sql,
          {
            id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            id_room,         // party 2
            limit,
            C1,
            C2,
            C3,
            C4,
            C5,
            plCount,
          }
        );

        if (result) {
          return result.outBinds.id[0];
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  }

//   class InitPlayer {
//   constructor(player, initBalance, enumPosition, isDealer, cards) {
//     this.player = player;
//     this.initBalance = initBalance;
//     this.enumPosition = enumPosition;
//     this.isDealer = isDealer;
//     this.cards = cards;
//   }
// }


async insertRawInit(newHandId, initPlayers, token, room, gameType) {
    // ID_HAND, ID_PLAYER, STACK, ID_POSITION
    if (this.connection) {
      const heroChair = enumPoker.enumPoker.gameTypesSettings[gameType].heroChair;
      const players = initPlayers.map((player, i) => {
        if (player !== undefined) {
          const tk = heroChair === i ? token : null;
          const ID_PLAYER = PlayersHandler.getPlayerIdFromDB(player.player, tk, room, gameType, isAdaptation);
          return [newHandId, ID_PLAYER, player.initBalance, player.enumPosition];
        }
      }).filter(row => row !== undefined);

      try {
        const sql = `INSERT INTO tt_raw_init VALUES (:1, :2, :3, :4)`;
        const result = await this.connection.executeMany(
          sql,
          players
        );
        console.log('insertRawInit result');
        console.log(result);

        if (result) {
          return players;
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  }

  async insertRawActions() {

  }

  doRelease() {
    if (this.connection) {
      this.connection.close(
        function(err) {
          if (err)
            console.error(err.message);
        });
    }
  }
}



module.exports.oracle = Oracle;