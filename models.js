const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite"
});
const Battery = sequelize.define("Battery", {
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    state: DataTypes.STRING,
    time: DataTypes.INTEGER
});

// (async () => await sequelize.sync({ force: true }))();
sequelize.sync();

module.exports = { Battery, sequelize }