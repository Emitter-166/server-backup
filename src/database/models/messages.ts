import { BLOB, BOOLEAN, INTEGER, STRING, Sequelize } from "sequelize";

export const define_messages = (sequelize: Sequelize) => {
    const model = sequelize.define('messages', {
            channelId: {
                type: STRING
            },
            userId: {
                type: STRING
            },
            messageId: {
                type: STRING
            },
            time: {
                type: INTEGER
            },
            text: {
                type: BLOB
            },
            attachments: {
                type: STRING
            }    
        }, {timestamps: false})

    return model;
}