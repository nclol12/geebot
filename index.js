const  Discord = require('discord.js');
const avconv = require('avconv')
const opusscript = require('opusscript')
const ffmpeg = require('ffmpeg')
const queue = new Map();
const {prefix , token } = require('./config.json');
const client = new Discord.Client();
const ytdl = require('ytdl-core')
const cheerio = require('cheerio')
const request = require('request')
const ping = require('minecraft-server-util')
const Embed = new Discord.MessageEmbed()
var version = '1.5';
var servers = {};

client.once('ready', () => {
    console.log('UP!')
    client.user.setActivity("Example status")
})

client.on('guildMemberAdd', member =>{
    const newLocal = "welcome";
    const channel = member.guild.channels.cache.find(channel => channel.name === "welcome")
    if(!channel) return;

    channel.send('Добро пожаловать на сервер, ${member}, Но перед тем как что либо писать прочитай правила!')

});

client.on('message', message => {
    if (message.member.hasPermission(['KICK_MEMBERS']))
    console.log(message.content);

    if(message.content.startsWith(`${prefix}kick`)) {
        let member = message.mentions.members.first();
        member.kick().then((member) => {
            message.channel.send("*БАМ* Пользователь был выгнан" + member.diplayName)
            

            })
      }
})

client.on('message', message => {
    if (message.member.hasPermission(['BAN_MEMBERS']))

if(message.content.startsWith(`${prefix}ban`)) {
    let member = message.mentions.members.first();
    member.ban().then((member) => {
        message.channel.send("*БАМ* Пользователь был забанен" + member.diplayName)
    
    })
}

})

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	} else {
		message.channel.send('er')
	}
});

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.channel.send('Зайди в голосовой канал чтобы продолжить воспроизведение!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('Дай мне разрешение зайти в канал!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} Добавленно в очередь!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('Зайди в голосовой канал чтобы остановить музон!');
	if (!serverQueue) return message.channel.send('Я не могу скипнуть так как в очереди нету музона!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('Эй бро зайди в голосовой канал чтобы послушать музыку!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.play(ytdl(song.url))
		.on('end', () => {
			console.log('Музон кончился!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.on('message', message =>{
	let args = message.content.substring(prefix.length).split(" ");

	switch(args[0]){
      case "poll":
		const Embed = new Discord.MessageEmbed()
		.setColor(0x00BDFF)
		.setTitle("тест")
		.setDescription("тест")

	if (!args[1]) {
		message.channel.send(Embed);
	}

	let msgArgs = args.slice(1).join(" ");

	message.channel.send("голосование! " + "**" + msgArgs + "**").then(messageReaction => {
		messageReaction.react("👍");
		messageReaction.react("👎");
		message.delete({ timeout: 1000 }).catch(console.error);
	});

	}

	})

	client.on('message', message => {
 
		let args = message.content.substring(prefix.length).split(" ");
	 
		switch (args[0]) {
			case 'pic':
			image(message);
	 
			break;
		}
	 
	});
	 
	function image(message){
	 
		var options = {
			url: "http://results.dogpile.com/serp?qc=images&q=" + "memes",
			method: "GET",
			headers: {
				"Accept": "text/html",
				"User-Agent": "Chrome"
			}
		};
	 
	 
	 
	 
	 
		request(options, function(error, response, responseBody) {
			if (error) {
				return;
			}
	 
	 
			$ = cheerio.load(responseBody);
	 
	 
			var links = $(".image a.link");
	 
			var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
		   
			console.log(urls);
	 
			if (!urls.length) {
			   
				return;
			}
	 
			// Send result
			message.channel.send( urls[Math.floor(Math.random() * urls.length)]);

		})
		
	}

	client.on('message', message =>{
 
		let args = message.content.substring(prefix.length).split(' ')
	 
		switch(args[0]){
			case 'stat':
	 
				if(!args[1]) return message.channel.send('айпи укажи')
				if(!args[2]) return message.channel.send('ты забыл указать порт')
	 
				ping(args[1], parseInt(args[2]), (error, reponse) =>{
					if(error) throw error
					const Embed = new Discord.MessageEmbed()
					.setTitle('Статусник')
					.addField('Айпишник', reponse.host)
					.addField('Вирсия', reponse.version)
					.addField('Кубоголовых в сети', reponse.onlinePlayers)
					.addField('Макс количество кубоголовых', reponse.maxPlayers)
				   
					message.channel.send(Embed)
				})
			break
	 
		}
	 
	})

client.on('message', message=>{
     
      let args = message.content.slice(prefix.length).split(' ');
      
   switch(args[0]){
     case 'help':
      const embed = new Discord.MessageEmbed()
        .setTitle('Помощь')
        .addField('gm.play,stop,skip для плеера')
        .addField('gm.kick,ban это модерация')
        .addField('gm.poll голосование')
        .addField('gm.stat айпи порт | статус серва майнкрафт ')
        .addField('gm.pic рандомная картинка мем')
        .addField('original code by Notcher3#8385')
         .setColor(0xF1C40F)
        message.channel.send(embed);
    break;


    }

})

client.login(token);
