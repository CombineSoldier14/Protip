const {Client, RichEmbed, MessageFlags} = require('discord.js');// require the discord.js module
const Discord = require('discord.js');
const client = new Client();
const fs = require('fs');
const fetch = require('node-fetch');

let config;
let settings;

let version;
let token;
let uptime = 0;

function save(){
    fs.writeFile('settings.json', JSON.stringify(settings), function(err){
        if(err){throw err;}
        console.log('Saved settings.');
    });
}

let uptimeINT = setInterval(function(){
    uptime++;
}, 60000)

fs.readFile('config.json', function(err, data){
    if(err){throw err;}
    config = JSON.parse(data);
    token = config.token;
    version = config.version;
    console.log('Read config.');

    fs.readFile('settings.json', function(err, data){
        if(err){throw err;}
        settings = JSON.parse(data);
        client.login(token);
        console.log('Read settings.');
    });
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on("guildCreate", (guild) => {   
    console.log(`Joined new guild: ${guild.name}`);

    fs.readFile('settings.json', function(err, data){
        if(err){throw err;}
        
        settings = JSON.parse(data);

        let obj = {};
        obj["prefix"] = ".";
        obj["name"] = guild.name;
        obj["ownerID"] = guild.ownerID;
        obj["role"] = "@everyone";
        obj["adminRole"] = "Admin";
        settings[guild.id] = obj;
        console.log(settings);

        fs.writeFile('settings.json', JSON.stringify(settings), function(err){if(err){throw err;}});
        console.log('Added new server to settings.')
    });
});

client.on('message', message => {
    if(!message.author.bot && message.channel.type != "dm"){//checking for channel type and bots
        var server = message.guild.id.toString();

        if(settings[server]['role'] == 'everyone'){
            settings[server]['role'] = '@everyone';
        }

        if(message.member.hasPermission(['SEND_MESSAGES'])){//checking for user role

            if(message.author.id == '571462642653331471' && message.content == '-close'){//shut down bot (sudo command)
                save();
                client.destroy();
                console.log('Successfully closed.');
            }
            else if(message.author.id == '571462642653331471' && message.content == '-save'){//save settings (sudo command)
                save();
                message.channel.send('Saved server settings.');
            }
            else if(message.content == settings[server]['prefix']+'about'){//about
                const aboutEmbed = new Discord.MessageEmbed()
                aboutEmbed.setColor('#fac036')
                aboutEmbed.setTitle('About\n')
                aboutEmbed.setDescription('A Discord bot designed to give helpful advice.\nIn ' + client.guilds.cache.size + ' servers.\nVersion: ' + version + '\n\n**Credits** \nCredit to <@571462642653331471> for creating the bot.')
                message.channel.send(aboutEmbed);
            }
            else if(message.content == settings[server]['prefix']+'help'){//help
                const helpEmbed = new Discord.MessageEmbed()
                helpEmbed.setColor('#fac036')
                helpEmbed.setTitle('Help\n')
                helpEmbed.setDescription('**' + settings[server]['role'] + ' commands:**\n``' + settings[server]['prefix'] + 'tip`` Recive a peice of advice.\n``' + settings[server]['prefix'] + 'help`` Brings you to this menu.\n``' + settings[server]['prefix'] + 'about`` Shows details about Protip.\n``' + settings[server]['prefix'] + 'source`` View the source code.\n``' + settings[server]['prefix'] + 'bug`` Report a bug/error.\n``' + settings[server]['prefix'] + 'suggest`` Suggest a feature.\n``' + settings[server]['prefix'] + 'invite`` Invite Protip to your server.\n``' + settings[server]['prefix'] + 'github`` View Protip\'s github repository.\n``' + settings[server]['prefix'] + 'website`` Visit the official Protip website.\n``' + settings[server]['prefix'] + 'uptime`` See how long Protip has been online\n\n**' + settings[server]['adminRole'] + ' commands:**\n``' + settings[server]['prefix'] + 'set prefix (new prefix)`` Set a new command prefix for Protip.')
                message.channel.send(helpEmbed);
            }
            else if(message.content == settings[server]['prefix']+'invite'){//invite link
                message.channel.send('If you would like to add Protip to your server please go to this link:\nhttps://discord.com/oauth2/authorize?client_id=792875120116891709&scope=bot&permissions=248832');
            }
            else if(message.content == settings[server]['prefix']+'bug'){//bug report
                message.channel.send('If you have found a bug please fill out this form:\nhttps://protip.now.sh/contact');
            }
            else if(message.content.startsWith(settings[server]['prefix']+'suggest')){//suggestion box
                message.channel.send('If you have any suggestions for future updates please fill out this form:\nhttps://protip.now.sh/contact');
            }
            else if(message.content.startsWith(settings[server]['prefix']+'uptime')){//uptime
                let calcUptime = Math.floor(uptime/60).toString();
                message.channel.send(`Protip has been online for ${calcUptime} hours.`);
            }
            else if(message.content == settings[server]['prefix']+'tip'){//tip
                fetch('https://api.adviceslip.com/advice')
                    .then(resp => {
                        let factBuffer = resp.body._outBuffer;
                        let fact = factBuffer.toString('utf-8');
                        let index1 = fact.indexOf('advice');
                        let index2 = fact.indexOf('}}');
                        fact = fact.slice(index1, index2);
                        fact = fact.replace('"', "");
                        index1 = fact.indexOf(':');
                        index2 = fact.length;
                        fact = fact.slice(index1+3, index2);
                        fact = fact.replace('"', "");
                        message.channel.send(fact);
                });
            }
            else if(message.content.startsWith(settings[server]['prefix']+'eval')){//eval joke
                message.channel.send('Nice try!');
            }
            else if(message.content.startsWith(settings[server]['prefix']+'source')){//view src
                message.channel.send('',{
                    files: ["source.txt"]
                })
            }
            else if(message.content.startsWith(settings[server]['prefix']+'set prefix ') && message.member.hasPermission(['ADMINISTRATOR'])){//set prefix
                let newPrefix = message.content.substring(12, message.content.length);
                if(newPrefix == settings[server]['prefix']){
                    message.channel.send('Prefix is already set to: ' + settings[server]['prefix']);
                }
                else{
                    settings[server]['prefix'] = message.content.substring(12, message.content.length);
                    save();
                    message.channel.send('Changed prefix to: ' + settings[server]['prefix']);
                }
            }
            else if(message.content.startsWith(settings[server]['prefix']+'github')){//github
                message.channel.send('Protip\'s Github repository:\nhttps://github.com/IMAD200');
            }
            else if(message.content.startsWith(settings[server]['prefix']+'website')){//webpage
                message.channel.send('https://protip.now.sh/');
            }
            else if(message.content.startsWith(settings[server]['prefix'])){//no command recognized
                message.channel.send('Sorry, I didn\'t recognize that command.\nUse ``' + settings[server]['prefix'] + 'help`` to see a list of commands.');
            }

        }
    }
});
