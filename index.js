const  Discord = require('discord.js');
const avconv = require('avconv')
const opusscript = require('opusscript')
const ffmpeg = require('ffmpeg')
const queue = new Map();
const {prefix , token } = require('./config.json');
const client = new Discord.Client();
const ytdl = require('ytdl-core')
const cheerio = require('cheerio')
const http = require('http')
const https = require('https')
const request = require('request')
const ping = require('minecraft-server-util')
const Embed = new Discord.MessageEmbed()
const moment = require('moment');
const fs = require('fs');
const { join } = require('path');
var version = '1.3';
var servers = {};



client.once('ready', () => {
    console.log('UP!')

client.user.setPresence({
    status: 'online',
    activity: {
        name: 'gm.help',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/notcher32'
    }
})

})

client.commands = new Discord.Collection();
 
const commandFiles = fs.readdirSync('./cmds/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./cmds/${file}`);
 
    client.commands.set(command.name, command);
}



client.on('guildMemberAdd', member =>{
    const newLocal = "привет";
    const channel = member.guild.channels.cache.find(channel => channel.name === "привет")
    if(!channel) return;

    channel.send('Добро пожаловать на сервер, ${member.username}`); Но перед тем как что либо писать прочитай правила!')

});

client.on('message', message => {

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

    if (message.member.hasPermission(['KICK_MEMBERS']))
    console.log(message.content);

    if(message.content.startsWith(`${prefix}kick`)) {
        let member = message.mentions.members.first();
        member.kick().then((member) => {
            message.channel.send("*WHOOSH* User was kicked")
            
      return console.log(`> kicked member  ${message.author.username}`);
            })
      }
})

client.on('message', message => {

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

    if (message.member.hasPermission(['BAN_MEMBERS']))

if(message.content.startsWith(`${prefix}ban`)) {
    let member = message.mentions.members.first();
    member.ban().then((member) => {
        message.channel.send("*Whoosh* User was banned")
      return console.log(`> banned member  ${message.author.username}`);
    
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
		
	}
});

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.channel.send('Join the voice channel bcz i need to know where to play music');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('Allow me to join the channel');
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
		return message.channel.send(`${song.title} Added to queue!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('Join the voice channel to skip!');
	if (!serverQueue) return message.channel.send('I cant skip there is no music in queue!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('Hey join the voice channel to play music!');
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
			console.log('End of the song!');
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
		.setDescription("Test")

	if (!args[1]) {
		message.channel.send(Embed);
	}

	let msgArgs = args.slice(1).join(" ");

	message.channel.send("Poll! " + "**" + msgArgs + "**").then(messageReaction => {
		messageReaction.react("👍");
		messageReaction.react("👎");
		message.delete({ timeout: 1000 }).catch(console.error);
         return console.log(`> made a poll  ${message.author.username}`);
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
	 
			message.channel.send( urls[Math.floor(Math.random() * urls.length)]);
             return console.log(`> laughed at a funny gif  ${message.author.username}`);

		})
		
	}

	client.on('message', message =>{

 	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
 
		let args = message.content.substring(prefix.length).split(' ')
	 
		switch(args[0]){
			case 'stat':
	 
				if(!args[1]) return message.channel.send('You didnt specify the ip')
				if(!args[2]) return message.channel.send('You didnt specify the port')
	 
				ping(args[1], parseInt(args[2]), (error, reponse) =>{
					if(error) throw error
					const Embed = new Discord.MessageEmbed()
					.setTitle('Status')
					.addField('IP', reponse.host)
					.addField('Version', reponse.version)
					.addField('Minecrafters online', reponse.onlinePlayers)
					.addField('Maximum amount of Players', reponse.maxPlayers)
				   
					message.channel.send(Embed)
                       return console.log(`> checked mc server status  ${message.author.username}`);
				})
			break
	 
		}
	 
	})

client.on('message', message=>{

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
     
      let args = message.content.slice(prefix.length).split(' ');
      
   switch(args[0]){
     case 'help':
      const embed = new Discord.MessageEmbed()
        .setTitle('Help')
        .addField('gm.play,stop,skip', 'Music commands')
        .addField('gm.8ball question', '8ball command')
        .addField('gm.offon', 'Shows How many people are online')
        .addField('gm.kick @упомянание', 'Kick a member')
        .addField('gm.ban @ping', 'Ban member')
        .addField('gm.poll Text', 'Poll command')
        .addField('gm.nickchan new nickname', 'Changes your nickname')
        .addField('gm.stat айпи порт', 'Shows Minecraft server status')
        .addField('gm.pic', 'Sends a meme picture')
        .addField('gm.accinf @ping', 'Shows member info')
        .addField('gm.id @ping ', 'Shows user id')
        .addField('gm.weather *insert location here*', 'Shows weather for any location credit to thesportstacker')
        .addField('gm.covid', 'shows coronavirus statistics credit to thesportstacker')
        .addField('Bot creator', 'Notcher3#8385')
        .addField('Add to your server', '')
         .setColor(0x00BDFF)
        message.channel.send(embed);
      return console.log(`> used help  ${message.author.username}`);
    break;


    }

})

client.on('message', message=>{

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
     
      let args = message.content.slice(prefix.length).split(' ');


   switch(args[0]){
     case 'tishobiban':
      const embed = new Discord.MessageEmbed()
        .setTitle('New Achievment')
        .addField('Ты нашёл секрет','1x mana orbs')
         .setColor(0x00BDFF)
        message.channel.send(embed);
      return console.log(`> found a easter egg  ${message.author.username}`);
    break;

}

});

client.on("message", async message => {
	const embed = new Discord.MessageEmbed()
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	
	let messageArray = message.content.split(" ");
	let command = messageArray[0];
	let args = messageArray.slice(1);
	let com = command.toLowerCase();
	var sender = message.author;

if(com === `${prefix}accinf`) {
	let ment = message.mentions.users.first();
		if(!ment) {
			message.channel.send('Specify user')
		}
		let embed = new Discord.MessageEmbed()
		.addField("Name", ment.tag)
		.addField("ID", ment.id)
		.addField("Status", ment.presence.status)
		.addField("Created", ment.createdAt)
		.setThumbnail(ment.avatarURL)
		message.channel.send(embed)
		return console.log(`> userinfo command used by ${message.author.username}`);
	}
})



client.on("message", message => {

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

    if (message.author.bot) return false;

    if (message.content.toLowerCase() == "gm.offon") {
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Server Online info`)
        embed.addField("Online", message.guild.members.cache.filter(member => member.presence.status !== "offline").size);
        embed.addField("Offline", message.guild.members.cache.filter(member => member.presence.status == "offline").size);
        message.channel.send(embed);
      return console.log(`> used offon  ${message.author.username}`);
    };
});

client.on('message', message=>{
     
      let args = message.content.slice(prefix.length).split(' ');
      
   switch(args[0]){
     case 'reload':
    if (message.author.id !== "509781424249896962") return false;
            resetBot(message.channel);
            break;

    }
});


function resetBot(channel) {
    channel.send('Reloading')
    .then(msg => client.destroy())
    .then(() => client.login(token));
};


client.on("message", async message => {

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
 
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == "id") {
        var userID = args[0].replace('<@', '').replace('>', '').replace('!', '');
        message.channel.send(userID);
      return console.log(`> checked userid  ${message.author.username}`);
    }
});

client.on('message', message => {
if (message.content.includes('nickchan')) {
    if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) return message.channel.send('I don`t have enough Permissions');
    message.member.setNickname(message.content.replace('gm.nickchan ', ''));
      return console.log(`> checked his nickname  ${message.author.username}`);
    }
});

client.on('message', function (message) {

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

  if (!message.guild) return
  let args = message.content.trim().split(/ +/g)
 
  if (args[0].toLowerCase() === prefix + "8ball") {
      if (!args[1]) return message.channel.send("Не спросил вопрос ._.")
      let answers = ["Nope", "Hrm maybe", "I don`t think so", "it might be true", "Yes"]
      let question = args.slice(1).join(" ")
      let embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL)
          .setColor("RANDOM")
          .addField("Вопрос :", question)
          .addField("Ответ :", answers[Math.floor(Math.random() * answers.length)])
      message.channel.send(embed)
  }
})


client.on("message", async message => {

    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;

    if(message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);

        const command = args.shift().toLowerCase();

        if(!client.commands.has(command)) return;


        try {
            client.commands.get(command).run(client, message, args);

        } catch (error){
            console.error(error);
        }
    }
})


client.login(token);
