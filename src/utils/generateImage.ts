import Canvas from 'canvas';
import Discord, { AllowedImageSize, GuildMember } from 'discord.js';

Canvas.registerFont('./Roboto-Regular.ttf', { family: 'Regular' });

const background = 'https://github.com/CoW-Tournament/CoW-Tournament-Bot/blob/main/imgs/MiniImage.png?raw=true';

const dim = {
    height: 675,
    width: 1200,
    margin: 50
};

const av = {
    size: 256 as AllowedImageSize,
    x: 480,
    y: 170
};

export default async (member: GuildMember) => {
    let username = member.user.username;
    let discrim = member.user.discriminator;
    let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: false, size: av.size });

    const canvas = Canvas.createCanvas(dim.width, dim.height);
    const ctx = canvas.getContext('2d');

    // draw in the background
    const backimg = await Canvas.loadImage(background);
    ctx.drawImage(backimg, 0, 0);

    // draw black tinted box
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(dim.margin, dim.margin, dim.width - 2 * dim.margin, dim.height - 2 * dim.margin);

    const avimg = await Canvas.loadImage(avatarURL);
    ctx.save();

    ctx.beginPath();
    ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avimg, av.x, av.y);
    ctx.restore();

    // write in text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    // draw in Welcome
    ctx.font = '50px Roboto';
    ctx.fillText('Welcome', dim.width / 2, dim.margin + 70);

    // draw in the username
    ctx.font = '60px Roboto';
    ctx.fillText(username + '#' + discrim, dim.width / 2, dim.height - dim.margin - 125);

    // draw in to the server
    ctx.font = '40px Roboto';
    ctx.fillText('to the server', dim.width / 2, dim.height - dim.margin - 50);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome.png');
    return attachment;
};
