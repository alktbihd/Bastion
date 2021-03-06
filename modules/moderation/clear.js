/**
 * @file clear command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = async (Bastion, message, args) => {
  if (!message.channel.permissionsFor(message.member).has(this.help.userPermission)) {
    /**
     * User has missing permissions.
     * @fires userMissingPermissions
     */
    return Bastion.emit('userMissingPermissions', this.help.userPermission);
  }
  if (!message.channel.permissionsFor(message.guild.me).has(this.help.botPermission)) {
    /**
     * Bastion has missing permissions.
     * @fires bastionMissingPermissions
     */
    return Bastion.emit('bastionMissingPermissions', this.help.botPermission, message);
  }

  let user = message.mentions.users.first();
  let limit = parseInt(args[0]) ? args[0] : args[1];
  let amount;
  if (user || args.includes('--bots')) {
    amount = 100;
  }
  else {
    amount = /^[1-9][0-9]?$|^100$/.test(limit) ? parseInt(limit) : 100;
  }

  try {
    let msgs = await message.channel.fetchMessages({
      limit: amount
    });

    msgs = msgs.filter(m => message.createdTimestamp - m.createdTimestamp < 1209600000);
    if (user) {
      msgs = msgs.filter(m => m.author.id === user.id).array().slice(0, /^[1-9][0-9]?$|^100$/.test(limit) ? parseInt(limit) : 100);
    }
    else if (args.includes('--bots')) {
      msgs = msgs.filter(m => m.author.bot).array().slice(0, /^[1-9][0-9]?$|^100$/.test(limit) ? parseInt(limit) : 100);
    }
    if (args.includes('--nonpinned')) {
      msgs = msgs.filter(m => !m.pinned);
    }
    if (msgs.size < 2 || msgs.length < 2) {
      let error;
      if ((msgs.size === 1 || msgs.length === 1) && (user || args.includes('--bots'))) {
        error = Bastion.strings.error(message.guild.language, 'singleMessage', true);
      }
      else {
        error = Bastion.strings.error(message.guild.language, 'noDeletableMessage', true);
      }

      /**
      * Error condition is encountered.
      * @fires error
      */
      return Bastion.emit('error', '', error, message.channel);
    }

    await message.channel.bulkDelete(msgs);

    let reason = 'No reason given';

    /**
    * Logs moderation events if it is enabled
    * @fires moderationLog
    */
    Bastion.emit('moderationLog', message.guild, message.author, this.help.name, message.channel, reason, {
      cleared: `${msgs.size || msgs.length}${args.includes('--nonpinned') ? ' non pinned' : ''} messages from ${user ? user : args.includes('--bots') ? 'BOTs' : 'everyone'}`
    });
  }
  catch (e) {
    Bastion.log.error(e);
  }
};

exports.config = {
  aliases: [ 'clr' ],
  enabled: true
};

exports.help = {
  name: 'clear',
  botPermission: 'MANAGE_MESSAGES',
  userPermission: 'MANAGE_MESSAGES',
  usage: 'clear [ @user-mention | --bots ] [--nonpinned] [no_of_messages]',
  example: [ 'clear 50', 'clear @user#0001 5', 'clear --bots 10', 'clear' ]
};
