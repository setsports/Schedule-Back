const xlsx = require('node-xlsx');
const Channel = require('../models/Channel.model');
const Game = require('../models/Game.model');
const AppGame = require('../models/AppGame.model');
const GeorgiaGame = require('../models/GeorgiaGame.model');
const RussiaGame = require('../models/RussiaGame.model');

function adjustTimeByGMT(time, gmtOffset) {
  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  date.setHours(date.getHours() - gmtOffset);

  const adjustedHours = date.getHours().toString().padStart(2, '0');
  const adjustedMinutes = date.getMinutes().toString().padStart(2, '0');

  return `${adjustedHours}:${adjustedMinutes}`;
}

function excelDateToJSDate(serial) {
  const excelEpoch = new Date(1899, 11, 30);
  const daysOffset = serial + 1;
  const date = new Date(
    excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000
  );

  return date.toISOString().split('T')[0];
}

function excelFractionToTime(fraction) {
  const totalHours = fraction * 24;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function adjustTimeForCountry(game, offset) {
  const [hours, minutes] = game.time.split(':').map(Number);
  let date = new Date(game.date);
  let adjustedHours = hours + offset;

  if (adjustedHours >= 24) {
    adjustedHours -= 24;
    date = addDays(date, 1);
  } else if (adjustedHours < 0) {
    adjustedHours += 24;
    date = addDays(date, -1);
  }

  const adjustedTime = `${String(adjustedHours).padStart(2, '0')}:${String(
    minutes
  ).padStart(2, '0')}`;

  return {
    ...game,
    date: date.toISOString().split('T')[0],
    time: adjustedTime,
  };
}

const uploadGames = async (req, res) => {
  const token = req.cookies.token;
  const file = req.file;
  const workspace = req.body.workspace;

  let model =
    workspace === 'English'
      ? Game
      : workspace === 'Georgian'
      ? GeorgiaGame
      : workspace === 'Russian'
      ? RussiaGame
      : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const translations = {
      Футбол: 'Football',
      Баскетбол: 'Basketball',
      ММА: 'MMA',
      Гонки: 'Racing',
      Теннис: 'Tennis',
      Хоккей: 'Hockey',
      Дартс: 'Darts',
      Футзал: 'Futsal',
      Каратэ: 'Karate',
      Документальный: 'Documentary',
    };

    await model.collection.drop();

    const sheets = xlsx.parse(file.path).slice(2);
    let gameData = [];
    let allChannels = new Set();

    for (const sheet of sheets) {
      const rows = sheet.data.slice(1);

      for (const data of rows) {
        const channels =
          workspace === 'Georgian'
            ? data[2].split(',').map((ch) => {
                let channel = [];
                channel[0] = ch.split(' ')[0] + ' ';
                channel[1] = 'Sports ';
                channel[2] = ch.split(' ')[1];

                return channel.join('');
              })
            : data[4].split(',').map((ch) => ch.trim());
        channels.forEach((channel) => allChannels.add(channel));
      }
    }

    const uniqueChannels = Array.from(allChannels);
    const foundChannels = await Channel.find({ name: { $in: uniqueChannels } });

    const channelMap = foundChannels.reduce((acc, channel) => {
      acc[channel.name] = channel._id;
      return acc;
    }, {});

    for (const sheet of sheets) {
      const rows = sheet.data.slice(1);

      for (const data of rows) {
        const channels =
          workspace === 'Georgian'
            ? data[2].split(',').map((ch) => {
                let channel = [];
                channel[0] = ch.split(' ')[0] + ' ';
                channel[1] = 'Sports ';
                channel[2] = ch.split(' ')[1];

                return channel.join('');
              })
            : data[4].split(',').map((ch) => ch.trim());
        const ids = channels
          .map((channel) => channelMap[channel] || null)
          .filter((id) => id !== null);

        workspace === 'Georgian'
          ? gameData.push({
              date: data[7],
              utcDate: excelDateToJSDate(data[0]),
              time: data[8],
              gmt: data[6],
              sport: data[3],
              name: data[4],
              channel: ids,
              country: sheet.name.split('Sheet_')[1],
              workspace,
            })
          : workspace === 'Russian'
          ? gameData.push({
              date: data[7],
              utcDate: excelDateToJSDate(data[0]),
              time: data[8],
              gmt: data[6],
              sport:
                data[2] === 'UFC'
                  ? 'MMA'
                  : data[2] && translations[data[2]]
                  ? translations[data[2]]
                  : data[2],
              name: data[3],
              channel: ids,
              country: sheet.name.split('Sheet_')[1],
              workspace,
            })
          : gameData.push({
              date: data[7],
              utcDate: excelDateToJSDate(data[0]),
              time: data[8],
              gmt: data[6],
              sport: data[2] === 'UFC' ? 'MMA' : data[2],
              name: data[3],
              channel: ids,
              country: sheet.name.split('Sheet_')[1],
              workspace,
            });
      }
    }

    console.log(gameData[gameData.length]);

    await model.insertMany(gameData);

    return res.status(200).json({ message: 'Successfully uploaded games' });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: 'Error uploading games' });
  }
};

const uploadAppGames = async (req, res) => {
  const token = req.cookies.token;
  const file = req.file;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    AppGame.collection.drop();

    const games = xlsx.parse(file.path)[0].data;
    const gameEntries = games.slice(1);
    const appGames = [];

    gameEntries.forEach((game) => {
      if (game.length > 0) {
        appGames.push({
          date: excelDateToJSDate(game[0]),
          time: excelFractionToTime(game[5]),
          league: game[1].trim(),
          sport: game[20],
          name: game[2],
          eventId: game[14] ? game[14] : '#',
          countries: game[11].split(',').map((country) => country.trim()),
        });
      }
    });

    await AppGame.insertMany(appGames);

    res.status(200).json({ message: appGames });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: 'Error uploading games' });
  }
};

const getGames = async (req, res) => {
  const { language, date, country } = req.body;

  if (!language || !date) {
    return res.status(400).json({ message: 'Language and date are required' });
  }

  try {
    let query = {};
    let queriedGames = {};

    let model =
      language === 'EN'
        ? Game
        : language === 'KA'
        ? GeorgiaGame
        : language === 'RU'
        ? RussiaGame
        : null;

    if (!model) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    country ? (query['date'] = date) : (query['utcDate'] = date);
    country ? (query['country'] = country) : '';

    const games = await model
      .find(query)
      .select('-_id -__v -createdAt -updatedAt')
      .populate('channel');

    games.forEach((game) => {
      queriedGames[game.name] = {
        date: game['date'],
        utcDate: game['utcDate'],
        time: adjustTimeByGMT(game['time'], game['gmt']),
        sport: game['sport'],
        name: game['name'],
        channel: game['channel'],
        country: game['country'],
      };
    });

    return res.status(200).json({ games });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAppGames = async (req, res) => {
  const { date, country, gmt } = req.body;

  if (!date || !country) {
    return res.status(400).json({ message: 'Date and country are required' });
  }

  try {
    let query = {};

    query['countries'] = country;

    const games = await AppGame.find(query).select(
      '-_id -__v -createdAt -updatedAt'
    );

    const adjustedGames = games.map((game) =>
      adjustTimeForCountry(game.toObject(), parseInt(gmt))
    );

    const filteredGames = adjustedGames.filter((game) => game.date === date);

    return res.status(200).json({ games: filteredGames });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadGames, uploadAppGames, getGames, getAppGames };
