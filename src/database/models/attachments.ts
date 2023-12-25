import { BLOB, BOOLEAN, INTEGER, STRING, Sequelize } from "sequelize";

export const define_attachments = (sequelize: Sequelize) => {
    const model = sequelize.define('attachments', {
        messageId: {
         type: STRING
        },
        name: {
         type: STRING
        },
        data: {
         type: BLOB
        }
     }, {timestamps: false})

    return model;
}