import { INTEGER, STRING, Sequelize } from "sequelize";

/**
 * Stores a channel's human readable name alongside its id, so a restore can
 * recreate channels with their original names instead of bare ids.
 *
 * `name` is stored encrypted (BLOB) to match how message text is handled.
 */
export const define_channels = (sequelize: Sequelize) => {
    const model = sequelize.define('channels', {
            channelId: {
                type: STRING,
                unique: true
            },
            name: {
                type: STRING
            },
            type: {
                type: INTEGER
            },
            parentId: {
                type: STRING,
                allowNull: true
            }
        }, {timestamps: false})

    return model;
}
