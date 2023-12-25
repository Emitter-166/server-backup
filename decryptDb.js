const crypto = require('crypto');
const readline = require('readline');
const Sequelize = require('sequelize');
const fs = require('fs/promises');
const { log } = require('console');
const consola = require('consola');

const safe_question = async (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        const stdin = process.openStdin();
        process.stdin.on("data", char => {
            char = char + "";
            switch (char) {
                case "\n": case "\r": case "\u0004":
                    stdin.pause();
                    break;
                default:
                    process.stdout.clearLine();
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(query + Array(rl.line.length+1).join("*"));
                    break;
            }
        });

        rl.question(query, value => {
            resolve(value);
        });
    });
}

(async () => {
    const pass = await safe_question('Enter your password: ')

    try{
        await fs.access('server.db', fs.constants.F_OK);

        //cleaning previous data
        await fs.rm('./decrypted', { recursive: true, force: true });
        await fs.mkdir('./decrypted/attachments', { recursive: true });
        
        await fs.copyFile('./server.db', './decrypted/server.db');
        consola.warn("Don't close terminal...")

    }catch(err){
        log("Database file \"server.db\" is not found.")
        process.exit(0);
    }

    const sequelize = await initialize_sequelize();
    const messages_model = sequelize.model('messages');
    const attachments_model = sequelize.model('attachments');

    //decrypting the messages
    const all_messages = await messages_model.findAll();
    consola.info(`Fetched ${all_messages.length} messages to decrypt`);

    let index = 0;
    for(let model of all_messages){
        index++;
        let encrypted_text = model.dataValues.text;
        const text = await decrypt(encrypted_text, pass);

        await model.update({text});

        if(index%10===0) consola.success(`Decrypted ${index} messages`)
    }
    if(index%10!==0) consola.success(`Decrypted ${index} messages`);

    //decrypting the attachments
    const all_attachments = await attachments_model.findAll();
    consola.info(`Fetched ${all_attachments.length} attachments to decrypt (this might take a long time)`);

    index = 0;
    for (let model of all_attachments){
        index++;
        let encrypted_data = model.dataValues.data;
        const data = await decrypt(encrypted_data, pass);

        await model.update({data});
        await fs.writeFile(`./decrypted/attachments/${model.dataValues.name}`, data);

        if(index%10===0) consola.success(`Decrypted ${index} attachments`);
    }
    if(index%10!==0) consola.success(`Decrypted ${index} attachments`);

    consola.success("Done Decrypting! Please check the decrypted directory.");
})()

const decrypt = async (text,pass) => {
    const key = crypto.scryptSync(pass, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes256', key, Buffer.alloc(16, 0));

    let original = decipher.update(Buffer.from(text, 'hex'));
    original = Buffer.concat([original, decipher.final()]);

    return original;
}

const initialize_sequelize = async () => {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './decrypted/server.db',
        logging: false
    })

    sequelize.define('messages', {
        channelId: {
        type: Sequelize.STRING
        },
        userId: {
        type: Sequelize.STRING
        },
        messageId: {
        type: Sequelize.STRING
        },
        time: {
        type: Sequelize.INTEGER
        },
        text: {
        type: Sequelize.BLOB
        },
        attachments: {
        type: Sequelize.STRING
        }    
    }, {timestamps: false})

    sequelize.define('attachments', {
        messageId: {
         type: Sequelize.STRING
        },
        name: {
         type: Sequelize.STRING
        },
        data: {
         type: Sequelize.BLOB
        }
     }, {timestamps: false})

    await sequelize.sync({})

    return sequelize;
}