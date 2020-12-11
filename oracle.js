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
      return {
        id: enumPoker.tokens[token][room][gameType].id,
        nickname: enumPoker.tokens[token][room][gameType].nickname
      };
    } else if (isAdaptation) {
      // db query
    } else {
      return {
        id: player.enumPosition,
        nickname: player.player
      };
    }
  }

  static getAdaptationFromDB(id, room) {
    return [1,1,1,1,1,1,1,1,1,1,1,1,1,1];        // will implementing
  }

  static getRoomId(room) {
    return enumPoker.rooms[room];
  }

  setPlayer(recognitionNickname) {
    let playerID = this.getPlayerIdFromDB(recognitionNickname).id;
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

  async insertStacks() {      // tt_hands

    function createStacksArr(maxSum, step) {
      const arr = [];
      [...Array(maxSum)].forEach((cur, i) => {
        const min = i + 1;
        [...Array(maxSum)].forEach((cur, middle) => {
          const max = maxSum - middle - min;
          if (middle >= min && max >= middle && (min + middle + max) === maxSum && (min%step === 0) && (middle%step === 0)) {
            arr.push(`${middle}:${middle}:${min}`);
          }
        });
      });

      return arr;
    }

    if (this.connection) {
      const stacks = createStacksArr(75, 3).map(cur => [`preflop:gto:${cur}`]);
      // const stacks = ['4:4:4'].map(cur => [`preflop:gto:${cur}`]);

      const sql = `INSERT INTO DISTRIB_TASKS(PARAMS) VALUES (:1)`;
      const result = await this.connection.executeMany(
        sql,
        stacks
      );
      console.log('insert stacks result');
      console.log(result);

      if (result) {
        await this.connection.commit();
      }
    }
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
        initPlayers,
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

      try {
        const newHandId = await this.insertHand(id_room, limit, board, plCount);                   // tt_hands
        console.log('tt_hands insert successful');
        const players = await this.insertRawInit(newHandId, initPlayers, token, room, gameType);   // tt_raw_init
        console.log('tt_raw_init insert successful');
        const actions = await this.insertRawActions(players, rawActions, newHandId);               // tt_raw_actions
        console.log('tt_raw_actions insert successful');


        await this.connection.commit();
      } catch (e) {
        console.log('oracle writing history error', e);
        this.connection.rollback();
      }
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

    // ID_HAND, ACT_NUM, STREET, ID_PLAYER, ID_ACTION, AMOUNT, PRE_POT, PRE_BET, PRE_STACK, MAX_BET, STRATEGY_ALL_LOG, STRATEGY_ONE_LOG

    let prevStreet = 0;
    let prevAction = 0;
    let maxAmount = 0;
    let prevBets = {};
    let prevStacks = {};
    console.log('players');
    console.log(players);
    const actions = rawActions.map( (action) => {
      // players [[newHandId, ID_PLAYER, player.initBalance, player.enumPosition], ...];
      const playerId = players.filter(player => {
        return player[3] === action.position;
      })[0][1];
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

      const STRATEGY_ALL = 'test STRATEGY_ALL_LOG';
      const STRATEGY_ONE = 'test STRATEGY_ONE_LOG';

      return [newHandId, curAction, street, playerId, action.action, amount, action.pot, PRE_BET, PRE_STACK, MAX_BET, STRATEGY_ALL, STRATEGY_ONE];
    });

    const sql = `INSERT INTO tt_raw_actions VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12)`;
    console.log('actions[0]');
    console.log(actions[0]);
    const result = await this.connection.executeMany(
      sql,
      actions,
    );
    console.log('insertRawActions result');
    console.log(result);
  }

  async insertHand(id_room, limit, board, plCount) {      // tt_hands
    if (this.connection) {
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
          const ID_PLAYER = PlayersHandler.getPlayerIdFromDB(player, tk, room, gameType, isAdaptation).id;
          return [newHandId, ID_PLAYER, player.initBalance, player.enumPosition];
        }
      }).filter(row => row !== undefined);

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
    }
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